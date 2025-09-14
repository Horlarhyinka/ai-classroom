import axios from 'axios';
import envVars from '../config/envVars';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { retryFn } from '../utils/factory';

class AuthService{
    
    static getAuthURL(){
        const SCOPE = encodeURIComponent('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email');
        const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${envVars.GOOGLE_CLIENT_ID}&redirect_uri=${envVars.GOOGLE_AUTH_CALLBACK}&scope=${SCOPE}&access_type=offline&prompt=consent`;
        return url
    }

    static async getClientInfo(code: string){
        return retryFn(async function() {
        try{
            const tokenRes = await axios.post('https://oauth2.googleapis.com/token', null, {
            params: {
                code,
                client_id: envVars.GOOGLE_CLIENT_ID,
                client_secret: envVars.GOOGLE_CLIENT_SECRET,
                redirect_uri: envVars.GOOGLE_AUTH_CALLBACK,
                grant_type: 'authorization_code',
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            });

            const accessToken = tokenRes.data.access_token;

            const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            });
            const user = userRes.data;
            if(!user){
                throw Error('Failed to fetch user data.')
            }
            return user;
        }catch(err){
            //@ts-expect-error "Error object format is unknown"
            throw Error(err?.response?.data?.message ?? err?.response?.message ?? err?.message ?? 'Google API error')
        }
    })
    } 
    

    static createToken(id: string){
        const signed = jwt.sign({ id }, envVars.APP_SECRET, {expiresIn: '2d'})
        return signed
    }

    static async validateToken(token: string){
        try{
            const { id } = jwt.verify(token, envVars.APP_SECRET) as {id: string}
            if(!id)return false;
            const targetUser = await User.findById(id)
            if(targetUser)return true;
        }catch(err){    
            console.log('Token verify error::', err)
            return false
        }
    }


}

export default AuthService;