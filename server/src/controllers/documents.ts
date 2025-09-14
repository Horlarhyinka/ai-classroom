import { Request, Response } from "express";
import { cloudinaryService } from "../services/cloudinary";
import Doc from "../models/doc";
import ResourceService from "../services/resource";
import mongoose from "mongoose";
import Persona from "../models/persona";
import VoiceService from "../services/voice";
import PersonaService from "../services/persona";
import Discussion from "../models/discussion";
import Chapter from "../models/chapter";
import catchAsync from "../utils/catch-async";
import Section from "../models/section";
import { generateThumbnailFromPdfFile, retryFn } from "../utils/factory";
import Message from "../models/message";
import fs from 'fs';

interface AuthRequest extends Request{
    user: {_id: string; firstName: string; lastName: string; email: string},
}
export const createDocument = catchAsync(async(req: Request, res: Response) =>{
    const user = (req as AuthRequest).user
    let file = req.file ?? req.files 
    if(Array.isArray(file)){
        file = file[0]
    }
    if(!file ){
         res.status(400).json({ message: 'Provide a file to upload'})
         return
        }
    const uploaded = await cloudinaryService.uploadFile(file as any)

    const docData: {name: string, size: number, thumbnail?: string, url: string, user: string} = {
        name: file.originalname as string,
        size: uploaded.bytes/1024,
        url: uploaded.secure_url,
        user: user?._id
    }


    const document = await Doc.create(docData)
    if(!document){
        res.status(501).json({message: 'Internal server error.'})
        return
    }
    res.status(201).json(document)
    try{
        await ResourceService.loadResources(document.url, document._id.toString())
        console.log("resources loaded....")
    }catch(err){
        console.log('error loading resources')
        document.status = 'failed'
        await document.save()
        return;
    }
    try{
    let userPersona = await Persona.findOne({ id: user?._id })
    if(!userPersona){
        const voice = await VoiceService.getRandomVoice()
        userPersona = await Persona.create({ id: user?._id, voice: voice?._id, role: 'student', name: `${user?.lastName} ${user?.firstName}`, isUser: true })
    }
    if(!userPersona)throw Error('An error occured: unable to create persona')
    const otherPersonas = await PersonaService.createNPersona(['student', 'student', 'teacher'])
    if(!otherPersonas?.length)throw Error('Failed to create class personas')
    //start discussion for chapter one, to speed up this process, I mean I don't want to create a discussions for chapters that have not been visited yet, gotta take things slow....Lol!!!
    const chapterOne = await Chapter.findOne({ docId: document._id, index: 1, })
    if(chapterOne){
        await Discussion.create({ chapter: chapterOne?._id, personas: [...otherPersonas.map(p=>p._id), userPersona._id], doc: document?._id})
        document.status = 'success'
        await document.save()
    }
    return
    }catch(err){
        console.log('error occured:', err)
        document.status = 'failed'
        await document.save()
        return;
    }

})

export const getDocuments = catchAsync(async(req: AuthRequest, res: Response) =>{
    const target = await Doc.find({user: req.user?._id}).populate(['simulation']).sort("-createdAt") //after auth you should get dpcs for the user
    if(!target){
        res.status(404).json({message: 'Document not found'})
        return
    }
    res.status(200).json(target)
    return
})

export const getDocument = catchAsync(async(req: AuthRequest, res: Response) =>{
    const { id } = req.params;
    const target = await Doc.findOne({ _id: id, user: req?.user?._id }) 
    if(!target){
        res.status(404).json({message: 'Document not found'})
        return
    }
    res.status(200).json(target)
    return
})

export const deleteDoc = catchAsync(async(req: AuthRequest, res: Response) =>{
        const { id } = req.params;
    const target = await Doc.findOne({ _id: id, user: req?.user?._id }) 
    if(!target){
        res.status(404).json({message: 'Document not found'})
        return
    }
    await Doc.findByIdAndDelete(id)
    res.status(200).json(target)
    return
})

export const getChapters = catchAsync(async(req: AuthRequest, res: Response)=>{
    const {id} = req.params;
    const target = await Doc.findOne({ _id: id, user: req?.user?._id }) 
    if(!target){
        res.status(404).json({message: 'Document not found'})
        return
    }
    const chapters = await Chapter.find({docId: id}).sort('index')
    res.status(200).json(chapters ?? [])
    return
})

export const getSections = catchAsync(async(req: AuthRequest, res: Response)=>{
    const {id, index} = req.params;
    if(typeof parseInt(index) !== 'number'){
        res.status(400).json({message: 'index must be an integer.'})
        return
    }
    const target = await Doc.findOne({ _id: id, user: req?.user?._id }) 
    if(!target){
        res.status(404).json({message: 'Document not found'})
        return
    }
    const sections = await Section.find({docId: id, chapter: parseInt(index)}).sort('index')
    console.log('found', sections?.length, 'sections.... for', id, 'index', index)
    res.status(200).json(sections ?? [])
    return
})

export const getDIscussions = catchAsync(async(req: AuthRequest, res: Response)=>{
    const {chapterId} = req.params;
    const chapter = await Chapter.findById(chapterId)
    if(!chapter){
        res.status(404).json({message: 'chapter not found'})
        return
    }
    const discussion = await Discussion.findOne({chapter: chapterId}).populate(['personas'])
    const messages = await Message.find({ discussion: discussion?._id}).populate({path: 'persona', populate: 'voice'})
    res.status(200).json({...(discussion?.toObject() ?? {}), messages: messages ?? []});
    return
})

export const startDiscussion = catchAsync(async(req: AuthRequest, res: Response)=>{
    const {chapterId, id: docId} = req.params;
    const document = await Doc.findById(docId)
    if(!document) {
        res.status(404).json({message: 'Document not found'})
        return 
    }

    const chapter = await Chapter.findById(chapterId)
    if(!chapter) {
        res.status(404).json({message: 'Chapter not found'})
        return
    }
    const existingDiscussion = await Discussion.findOne({chapter: chapter._id})
    if(existingDiscussion){
        res.status(201).json(existingDiscussion)
        return
    }
    let userPersona = await Persona.findOne({ id: req.user?._id })
    if(!userPersona){
        const voice = await VoiceService.getRandomVoice()
        userPersona = await Persona.create({ id: req.user?._id, voice: voice?._id, role: 'student', name: `${req.user?.lastName} ${req.user?.firstName}`, isUser: true })
    }
    if(!userPersona)throw Error('An error occured: unable to create persona')
    const otherPersonas = await PersonaService.createNPersona(['student', 'student', 'teacher'])
    if(!otherPersonas?.length)throw Error('Failed to create class personas')
    const discussion = await Discussion.create({personas: [...otherPersonas, userPersona], doc: document._id, chapter: chapter._id, user: req.user._id})
    res.status(201).json(discussion)
    return
})