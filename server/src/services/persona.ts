import axios from 'axios';
import Persona from '../models/persona';
import VoiceService from './voice';

const name_fake_url = 'https://api.namefake.com/english-united-states/male/e9ddb9e68b7c8e461586506ae1269c0a'

class PersonaService{

    static async createNPersona(roles: ('student' | 'teacher')[] = []) {
        try{
        const apiRes = await axios.get(`https://fakerapi.it/api/v1/persons?_quantity=${roles.length}`)
        if(apiRes.data.code !== 200)return []
        const { data } = apiRes.data
        const createData = await Promise.all(roles.map(async(role, i)=>{
            const personData = data[i]
            if(!personData) throw Error('Persona API Error')
            const voice = await VoiceService.getRandomVoice()
            return {
                role,
                isUser: false,
                name: `${personData?.lastname} ${personData?.firstname}`,
                voice: voice?._id
            }
        }))
    return await Persona.create(createData)
        }catch(err){
            console.log('Error occured while creating persona:', err)
            const systemPersonas = await Persona.find({isUser: false})
            if(!systemPersonas?.length)throw Error('Unable to generate personas')
            const teachers = systemPersonas.filter(p=>p.role == 'teacher')
            const students = systemPersonas.filter(p=>p.role == 'student')
            if(!teachers?.length || !students?.length)throw Error('Unable to generate personas')
            const result = roles.map(r=>{
                if(r == 'student'){

                const randIndex = Math.floor(Math.random() * students.length)
                return students[randIndex]
                }else{
                    const randIndex = Math.floor(Math.random() * teachers.length)
                    return teachers[randIndex]
                }
            })
            return result
        }
    }

}

export default PersonaService