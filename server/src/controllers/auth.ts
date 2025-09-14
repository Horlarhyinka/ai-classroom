import { Request, Response} from 'express'
import AuthService from '../services/auth'
import catchAsync from '../utils/catch-async'
import envVars from '../config/envVars'
import User from '../models/user'

export const googleAuth = catchAsync(async(req: Request, res: Response) =>{
    const redirectUri = AuthService.getAuthURL()
    res.redirect(redirectUri)
    return;
})

export const authCallback = catchAsync(async(req: Request, res: Response) =>{

    const code = req.query.code;
    if(!code){
        console.log('no code found...')
        res.redirect(envVars.GOOGLE_AUTH_CALLBACK + '?error=true&message=auth%20error')
        return;
    }
    try{

    const userInfo = await AuthService.getClientInfo(code?.toString())
    const {email, given_name: firstName, family_name: lastName, picture} = userInfo;
    const user = (await User.findOne({email})) ?? (await User.create({ email, firstName, lastName, picture}))
    console.log({user})
    //encode session and send...
    if(!user){
        console.log('no user found...');
        res.redirect(envVars.AUTH_REDIRECT_URL + '?error=true&message=auth%20error')
        return
    };
        const token = AuthService.createToken(user?._id?.toString());
        (req.session as any).user = user;
        (req.session as any).token = token;
        
        console.log('=== Callback Session Debug ===');
        console.log('Setting session for user:', user.email);
        console.log('Session ID before save:', req.session.id);
        console.log('Token created:', token);
        
        req.session.save(err => {
        if (err) {
            console.error('Error saving session:', err);
            return res.redirect(envVars.AUTH_REDIRECT_URL + '?error=session');
        }
        console.log('Session saved successfully');
        console.log('Session ID after save:', req.session.id);
        console.log('Session data:', { user: (req.session as any).user, token: (req.session as any).token });
        res.redirect(envVars.AUTH_REDIRECT_URL);
        });

    return
    }catch(err){
        console.log('Auth callback error:', err)
        res.redirect(envVars.AUTH_REDIRECT_URL + '?error=true&message=auth%20error')
        return
    }
})

export const getSession = catchAsync(async(req: Request, res: Response)=>{
    
    const user = (req.session as any).user;
    const token = (req.session as any).token;
    
    if(!user || !token){
        console.log('No user or token found in session');
        res.status(401).json({message: 'Unauthenticated'})
        return
    }
    
    const validateRes = await AuthService.validateToken(token)
    
    if(!validateRes){
        console.log('Token validation failed, clearing session');
        (req.session as any).user = null;
        (req.session as any).token = null;
        res.status(401).json({message: 'Unauthenticated'})
        return
    }
    
    console.log('Session validation successful');
    res.status(200).json({ user, token })
    return
})

export const logout = catchAsync(async(req: Request, res: Response)=>{
    (req.session as any).user = null;
    (req.session as any).token = null;
    req.session.destroy((err)=>{
        if(err)throw Error(err)      
    res.status(200).json({})
    return
    })
})