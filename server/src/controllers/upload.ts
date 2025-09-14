import { Request, Response } from "express";
import { cloudinaryService } from "../services/cloudinary";


export const uploadFile = async(req: Request, res: Response) =>{
        let file = req.file ?? req.files 
        if(Array.isArray(file)){
            file = file[0]
        }
        if(!file ){
             res.status(400).json({ message: 'Provide a file to upload'})
             return
            }
        const uploaded = await cloudinaryService.uploadFile(file as any, 'thumbnails')
        console.log('Upload Response:', uploaded)
        res.status(200).json(uploaded)
        return 
}