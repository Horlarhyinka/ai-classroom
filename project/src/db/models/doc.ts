import mongoose from 'mongoose'

const docSchema = new mongoose.Schema({
    title: { type: String, required: true},
    chapters: { type: [mongoose.Schema.Types.ObjectId], ref: 'chapter', required: true, default: []},
    status: {type: String, enum: ['processed', 'pending', 'failed'], default: 'pending'},
    sections: { type: [mongoose.Schema.Types.ObjectId], ref: 'section', required: true, default: []},
    url: { type: String, required: true}
}, { timestamps: true })


const Doc = mongoose.models.doc ?? mongoose.model('doc', docSchema)

export default Doc
