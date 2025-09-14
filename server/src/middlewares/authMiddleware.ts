import { NextFunction, Request, Response } from "express";
import AuthService from "../services/auth";

interface AuthReq extends Request{
    user: any;
}

async function authMiddleware(req: Request, res: Response, next: NextFunction){
    //@ts-expect-error "token and user not types in session"
    if(!req.session?.token || !req.session?.user){
        res.status(401).json({message: 'Unauthenticated'})
        return
    }
    const token = (req.session as any).token;
    const user = (req.session as any).user;
    const tokenVerified = await AuthService.validateToken(token)
    if(!tokenVerified){
        res.status(401).json({message: 'Unauthenticated'})
        return
    };
    (req as AuthReq).user = user;
    next()
    
}

export default authMiddleware