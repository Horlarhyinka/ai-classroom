import { Request, Response, NextFunction} from "express"
import catchMongooseErrors from "./catch-mongoose-errors"

export default (fn: Function)=>{
    return async(req: Request, res: Response, next: NextFunction)=>{
        try{
            return await fn(req, res, next)
        }catch(err: any){
            const mongooseErrors = catchMongooseErrors(err)
            if(mongooseErrors)return res.status(400).json({message: mongooseErrors})
            console.log({err})
            return res.status(500).json({message: "internal server error"})
        }
}
}