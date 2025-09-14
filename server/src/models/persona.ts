import mongoose from 'mongoose';
import './voice'

const personaSchema = new mongoose.Schema({
    name: { type: String, required: true},
    id: { type: mongoose.Schema.Types.ObjectId, required: true, default: () => new mongoose.Types.ObjectId() },
    voice: { type: mongoose.Schema.Types.ObjectId, ref: 'voice', required: true},
    role: {type: String, enum: ['student', 'teacher']},
    isUser: { type: Boolean, default: false},
})

const Persona = mongoose.models.persona ?? mongoose.model('persona', personaSchema)

export default Persona