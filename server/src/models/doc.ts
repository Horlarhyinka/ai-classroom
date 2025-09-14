import mongoose from 'mongoose'
import './user'
import './simulation'

const docSchema = new mongoose.Schema({
    name: { type: String, required: true},
    size: { type: Number, required: true},
    thumbnail: { type: String, required: false},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    url: { type: String, required: true},
    simulation: { type: mongoose.Schema.Types.ObjectId, ref: 'simulation', required: false},
    status: { type: String, enum: ['failed', 'pending', 'success'], default: 'pending'}
}, { timestamps: true })

const Doc = mongoose.models.doc ?? mongoose.model('doc', docSchema);

export default Doc;