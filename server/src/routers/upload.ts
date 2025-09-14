import { Router } from 'express';
import { uploadFile } from '../controllers/upload';
import multer from 'multer';

const router = Router()

const upload = multer()

router.post('/', upload.any(), uploadFile)

export default router;