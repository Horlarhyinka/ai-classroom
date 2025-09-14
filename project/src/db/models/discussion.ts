import mongoose from 'mongoose'

const discussionSchema = new mongoose.Schema({
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'chapter'},

})

const Discussion = mongoose.models.discussion ?? mongoose.model('discussion', discussionSchema)

export default Discussion