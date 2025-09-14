import mongoose from 'mongoose';
import './simulation'

const sectionSchema = new mongoose.Schema({

    title: { type: String, required: true },
    body: { type: String, required: true },
    docId: { type: mongoose.Schema.Types.ObjectId, ref: 'simulation', required: true},
    index: {type: Number, required: true},
    chapter: { type: Number, required: true},
}, { timestamps: true })


const Section = mongoose.models.section ?? mongoose.model('section', sectionSchema)

export default Section