import mongoose from 'mongoose'
import './chapter';
import './persona';
import './doc';
import './user';

const discussionSchema = new mongoose.Schema({
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'chapter'},
    personas: {type: [mongoose.Schema.Types.ObjectId], ref: 'persona', default: []},
    doc: { type: mongoose.Schema.Types.ObjectId, ref: 'doc'},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
}, {timestamps: true})


const Discussion = mongoose.models.discussion ?? mongoose.model('discussion', discussionSchema)





export default Discussion