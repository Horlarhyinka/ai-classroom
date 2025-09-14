import { Server } from 'socket.io';
import {Server as HttpServer } from 'http';
import ChapterModel from '../models/chapter';
import DocModel from '../models/doc';
import DiscussionModel from '../models/discussion';
import ResourceService from './resource';
import { Persona } from '../utils/types';
import PersonaModel from '../models/persona';
import MessageModel from '../models/message';
import envVars from '../config/envVars';

interface ServerToClient{
    message: (payload: { data: {
        data: { body: string; persona: string}
        channel: string;
    }})=>Promise<void>,
    message_queue: (payload: {
        data: { data: { body: string; persona: string}[]; channel: string;}
    })=>Promise<void>,
    start_discussion: (payload: {docId: string, chapter: string, channel: string})=>Promise<void>,
    user_message: (payload: {channel: string, body: string})=>Promise<void>,
    join_discussion: (payload: {channel: string}) =>Promise<void>,
}

interface ClientToServer{
    message: (payload: { data: {
        data: { body: string; persona: string}
        channel: string;
    }})=>Promise<void>,
    message_queue: (payload: {
        data: { data: { body: string; persona: Persona}[]; channel: string;}
    })=>Promise<void>,
    start_discussion: (payload: {docId: string, chapter: string})=>Promise<void>,
    user_message: (payload: {channel: string, body: string})=>Promise<void>,
    join_discussion: (payload: {channel: string}) =>Promise<void>,
}

interface ServerToServer{
    message: (payload: { data: {
        data: { body: string; persona: string}
        channel: string;
    }})=>Promise<void>,
}

class SocketService{

    static useSocketServer(server: HttpServer) {
    const io = new Server<ServerToClient, ClientToServer, ServerToServer>(server, {cors: {origin: envVars.CLIENT_BASE_URL}})
    const Channels:{[channel: string]: {body: string; persona: string}[]} = {

    }
    io.on('connection', (socket)=>{
        socket.on('message_queue', async(payload)=>{
            console.log('server to server message queue received')
            console.log('Payload:', payload)
            Channels[payload?.data?.channel] = Array.isArray(payload?.data?.data) ? payload?.data?.data: [payload?.data?.data]
        })

        socket.on('start_discussion', async(payload)=>{
            console.log('start_discussion event received:', {payload})
            const {docId, chapter, channel} = payload;
            if(!socket.rooms.has(channel)){
                socket.join(channel)
            }
            const doc = await DocModel.findById(docId)
            const targetChapter = await ChapterModel.findById(chapter)
            if(doc && targetChapter){
                const data = await ResourceService.generateDiscussions(chapter, doc.user)
                console.log('data ->', data)
                if(data?.messages && data?.discussion){
                    targetChapter.discussion = data?.discussion?._id
                    targetChapter.discussionStarted = true;
                    await targetChapter.save()
                    const generatedData = data.messages
                    socket.join(data?.discussion?._id?.toString())
                    if(generatedData){

                    // const msgQueueData = generatedData.map((gd: {persona: string, body: string, discussion: string,})=>({data: {persona: gd.persona, body: gd.body}, channel: gd.discussion}))
                    Channels[data?.discussion?._id?.toString()] = generatedData
                    }
                }
            }
        })

        socket.on('join_discussion', async(payload)=>{
            if(!socket.rooms.has(payload.channel)){
                socket.join(payload.channel)
            }
        })

        socket.on('user_message', async(payload)=>{
            console.log('user_message event received on the server...')
            const target = await DiscussionModel.findById(payload.channel).populate(['personas'])
            console.log('Discussion:', target)
            if(target){
                const userPersona = target.personas.find((p: {isUser: boolean, id: string, _id: string})=>p.isUser)

                if(userPersona){
                    const chapter = await ChapterModel.findById(target.chapter).populate(['discussion', 'docId'])
                    let newMessage = await MessageModel.create({persona: userPersona?._id, body: payload?.body, discussion: payload?.channel})
                    newMessage = await newMessage.populate({path: 'persona', populate: 'voice'})
                    io.to(target?._id?.toString()).emit('message', {
                                data: {
                                    data: newMessage, 
                                    channel: target?._id?.toString()
                                }
                            })
                    if(chapter.discussion){
                        const messageData = await ResourceService.extendDiscussion(payload.channel, (Channels[payload.channel] ?? []).map(m=>({...m, sent: false, discussion: payload?.channel})), newMessage);
                        Channels[target._id?.toString()] = [...(messageData ?? [])]
                        console.log('Responded extend data::', messageData)
                    }
                }
            }
        })

            setInterval(async()=>{
                const channels = Object.keys(Channels)
                if(!channels.length){
                }else{
                    for(let channelId of channels){
                        try{

                        const channelData = Channels[channelId].shift()
                        if(!Channels[channelId]?.length){
                            delete Channels[channelId]
                        }
                        if (channelData) {
                            const targetPersona = await PersonaModel.findOne().or([{id: channelData?.persona}, {_id: channelData?.persona}]);
                            console.log('Emmitting message:', channelData, 'to:', targetPersona)
                            let message = await MessageModel.create({persona: targetPersona?._id, body: channelData?.body, discussion: channelId})
                            message = await message.populate({path: 'persona', populate: 'voice'})
                            io.to(channelId).emit('message', {
                                data: {
                                    data: message, 
                                    channel: channelId
                                }
                            })
                        }
                        }catch(err){
                            console.log('Error occured in sending message:', err)
                            continue;
                        }
                    }
                }
            }, 10000)
        


    })
}
}

export default SocketService