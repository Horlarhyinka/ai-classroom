import mongoose from 'mongoose'
import './doc'

const simulationSchema = new mongoose.Schema({
    title: { type: String, required: true},
    chapters: { type: [mongoose.Schema.Types.ObjectId], ref: 'chapter', required: true, default: []},
    status: {type: String, enum: ['processed', 'pending', 'failed'], default: 'pending'},
    sections: { type: [mongoose.Schema.Types.ObjectId], ref: 'section', required: true, default: []},
    url: { type: String, required: true},
    doc: { type: mongoose.Schema.Types.ObjectId, ref: 'doc', required: true}
}, { timestamps: true })


const Simulation = mongoose.models.simulation ?? mongoose.model('simulation', simulationSchema)

export default Simulation
