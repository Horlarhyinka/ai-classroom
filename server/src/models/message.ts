import mongoose from 'mongoose';
import './discussion'
import './persona'

const messageSchema = new mongoose.Schema({
    persona: { type: mongoose.Schema.Types.ObjectId, ref: 'persona', required: true },
    body: { type: String, require: true},
    sent: { type: Boolean, default: false},
    discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'discussion'},
}, { timestamps: true})

const Message = mongoose.models.message ?? mongoose.model('message', messageSchema)

export default Message