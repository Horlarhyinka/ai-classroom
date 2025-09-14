import mongoose from 'mongoose';
import './doc'

const sectionSchema = new mongoose.Schema({

    title: { type: String, required: true },
    body: { title: String, required: true },
    docId: { type: mongoose.Schema.Types.ObjectId, ref: 'doc', required: true},
    index: {type: Number, required: true},
    chapter: { type: Number, required: true},
}, { timestamps: true })


const Section = mongoose.models.section ?? mongoose.model('section', sectionSchema)

export default Section