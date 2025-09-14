import mongoose from 'mongoose';
import './doc';
import Discussion from './discussion';

const chapterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    docId: { type: mongoose.Schema.Types.ObjectId, ref: 'doc', required: true},
    index: {type: Number, required: true},
    discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'discussion', }, 
    discussionStarted: {type: Boolean, default: false}
}, { timestamps: true })


const Chapter = mongoose.models.chapter ?? mongoose.model('chapter', chapterSchema)

export default Chapter