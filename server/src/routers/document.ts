import { Router } from "express";
import { createDocument, deleteDoc, getChapters, getDIscussions, getDocument, getDocuments, getSections, startDiscussion } from "../controllers/documents";
import multer from "multer";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router()

const upload = multer()

router.post('/', authMiddleware, upload.any(), createDocument)
router.get('/', authMiddleware, getDocuments)
router.get('/:id', authMiddleware, getDocument)
router.delete('/:id', authMiddleware, deleteDoc)
router.get('/:id/chapters', authMiddleware, getChapters)
router.get('/:id/chapters/:chapterId/discussions', authMiddleware, getDIscussions)
router.post('/:id/chapters/:chapterId/discussions', authMiddleware, startDiscussion)
router.get('/:id/chapters/:index', authMiddleware, getSections)

export default router