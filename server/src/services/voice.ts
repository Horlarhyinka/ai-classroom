import envVars from "../config/envVars";
import axios from 'axios';
import logger from 'jet-logger';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import Voice from "../models/voice";

const api_key: string = envVars.ELEVEN_LAB_API_KEY

class VoiceService{
    constructor(){}

    static loadVoicesToDB = async() =>{
        try{
            const apiRes = await axios.get(envVars.VOICE_API_URL, {headers: {'api-key': envVars.VOICE_API_KEY}})
            if(!apiRes.data || !apiRes.status.toString().startsWith('2'))throw Error('Murf API error...')

                await Promise.all(apiRes.data.map(async(voiceData: {voiceId: string, displayName: string, gender: string, })=>{
                    const existing = await Voice.findOne({ id: voiceData.voiceId })
                    if(!existing){
                        const created = await Voice.create({ id: voiceData.voiceId, name: voiceData.displayName, gender: voiceData.gender })
                        return created
                    }else{
                        return existing
                    }
                }))

        }catch(err){
            if(err){
                console.log('Error fetching from Voice API:', err)
            }
        }
    }

    static getVoiceByName = async(name: string) =>{
        return Voice.findOne({name})
    }

    static listVoices = async(options: any = {}) =>{
        return Voice.find(options)
    }

    static getVoiceById = async(id: string) =>{
        return Voice.findOne({ id })
    }

    static getRandomVoice = async()=>{
        const voices = await VoiceService.listVoices()
        if(!voices.length)return null
        const randIndex = Math.floor(Math.random() * voices.length)
        return voices[randIndex]
    }

    bufferTextToSpeech = async(text: string, voice_id: string) =>{

    }



}

export default VoiceService