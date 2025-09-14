import { extractFileFromURL, retryFn } from "../utils/factory";
import type { Chapter, Message, Persona, Section } from "../utils/types";
import axios from 'axios'
import { getGeminiToken } from "./token";
import { generateChapter, generateSection, generateDIscussionFromChapter, extendDiscussionMessages } from "../lib/gemini";
import ChapterModel from "../models/chapter";
import SectionModel from "../models/section";
import DiscussionModel from '../models/discussion';
import PersonaModel from '../models/persona';
import UserModel from '../models/user';
import VoiceService from "./voice";
import PersonaService from "./persona";
import MessageModel from '../models/message'


class ResourceService{
    preChapters: string[] | undefined = []
    chapters: Chapter[] = [];
    sections: Section[] = [];
    
    constructor(
        private url: string, private docId: string){
            this.url = url
    }
    // static initModel(docId: string): ResourceModel {
    //     return 
    // }
    static loadResources = async(url: string, docId: string) => {
        const preChapters = []
        try{
            if(!url) throw Error('Failed to extract document.')
            const fileString = await extractFileFromURL(url)
        console.log('file string length:', fileString?.length)
            if(fileString) {
                    const l = 5000
                for(let i = 0; i < fileString.length; i += l) {
                    preChapters?.push(fileString.slice(i, i+l >= fileString.length? fileString.length: i+l))
                }
            }
            console.log('Number of pre chapters:', preChapters?.length)
            //break it down into chapters
            let chaptersData: {title: string; body: string, index?: number, _id: string}[] = []
            const chapters = await Promise.all((preChapters ?? []).map(async(ch, i)=>retryFn(async()=>{
                const token = getGeminiToken()
                try{
                    const rd = await generateChapter(token!, ch, chaptersData.map(cd=>cd.title),)
                    console.log({ rd })
                    if(Array.isArray(rd)){
                        for(let k = 0; k < rd.length;k++){
                            const r = rd[k]
                            const c = await ChapterModel.create({ ...(r ?? {}), docId, index: i + 1})
                            chaptersData.push(c)
                        }
                    }
                }catch(err){
                    console.log('Failed to generate chapter:', i, err)
                }})
            ))

            console.log({chaptersData})
            const sectionsData: {title: string; body: string, index?: number}[] = []
            if(chaptersData.length) {
                await Promise.all(chaptersData.map(async(chd)=>retryFn(async()=>{
                    const token = getGeminiToken()
                    const rd = await generateSection(token!, chd.body)
                    if(Array.isArray(rd)){
                    for(let k = 0; k < rd.length;k++){
                        const r = rd[k]
                        sectionsData.push({...(r ?? {}), index: sectionsData.length + 1})
                        await SectionModel.create({ 
                            ...(r ?? {}), 
                            docId, 
                            index: sectionsData.length,
                                chapter: chd.index
                        })
                    }
                }
                })))
            }
            
        }catch(err){
            console.log('error loading resource::', err)
            throw err
        }
    }

    static generateDiscussions = async(chapterId: string, userId: string)=>{
        try{
            const chapter = await ChapterModel.findById(chapterId).populate('docId')
            if(!chapter)throw Error('Chapter not found.')
            let discussion = await DiscussionModel.findOne({chapter: chapterId}).populate({path: 'personas'})
            const {docId: document} = chapter
            let personas: Persona[] = discussion?.personas?.length ? discussion.personas: []
            if(!discussion || !discussion?.personas.length){
                const user = await UserModel.findById(userId);
                if(!user)throw Error('User not found.')
                let userPersona = await PersonaModel.findOne({id: userId})
                if(!userPersona){
                    const voice = await VoiceService.getRandomVoice()
                    userPersona = await PersonaModel.create({id: userId, isUser: true, voice: voice?._id, name: `${user?.lastName} ${user?.firstName}`, role: 'student'})
                }
                if(!userPersona)throw Error('Unable to create user personas')
                const utilPersonas = await PersonaService.createNPersona(['teacher', 'student', 'student'])
                if(!utilPersonas?.length)throw Error('Unable to create utility personas')
                personas = [userPersona, ...utilPersonas]
                if(discussion){

                    discussion = await DiscussionModel.findByIdAndUpdate(discussion._id, {personas}, {new: true})
                }else{
                    discussion = await DiscussionModel.create({personas, chapter: chapterId, doc: document?._id, user: userId})
                }
            }
            if(!discussion)throw Error('Unable to generate discussion')
            const token = getGeminiToken()
            if(!token)throw Error('Unable to generate gemini API token.')
            console.log('Going in with the following personas....', personas)
            const genMessageResponse = await retryFn(()=>generateDIscussionFromChapter(token, chapter.title, chapter.body, personas))
            const messageData = genMessageResponse?.map((m: {persona_id: string, persona_name: string, body: string})=>({persona: m?.persona_id, body: m?.body, discussion: discussion?._id}))
            return {messages: messageData, discussion}
        }catch(err){
            console.log('Error generating Discussions:', err)
        }
    }

    static extendDiscussion = async(id: string, queued: Message[], newMessage: Message) =>{
        try{
            const discussion = await DiscussionModel.findById(id).populate(['personas','chapter'])
            if(!discussion) throw Error('Discussion not found.')
            const token = getGeminiToken()
            if(!token)throw Error('Unable to generate gemini API token.')
            const messages = await MessageModel.find({discussion: discussion?._id}).sort('createdAt').populate(['persona']).limit(10)
            const extendedRes = await retryFn(()=>extendDiscussionMessages(token, discussion?.chapter?.title, discussion?.chapter?.body, messages, queued, newMessage, discussion.personas))
            const messageData = extendedRes?.map((m: {persona_id: string, persona_name: string, body: string})=>({persona: m?.persona_id, body: m?.body, discussion: discussion?._id}))
            return messageData;
        }catch(err){
            console.log('Error extending discussion message:', err)
        }
    }


    
}

export default ResourceService