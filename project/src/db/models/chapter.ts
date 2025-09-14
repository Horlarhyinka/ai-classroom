import mongoose from 'mongoose';
import './doc'
import Discussion from './discussion';

const chapterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { title: String, required: true },
    docId: { type: mongoose.Schema.Types.ObjectId, ref: 'doc', required: true},
    index: {type: Number, required: true},
    discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'discussion', }, 
}, { timestamps: true })

chapterSchema.pre('save', async function(){
    if(this.isNew) {
        if(!this.discussion){
            //create discussion and attach and save.
            const newDiscussion = await Discussion.create({chapter: this._id })
            this.discussion = newDiscussion?._id
        }
    }
})

const Chapter = mongoose.models.chapter ?? mongoose.model('chapter', chapterSchema)

export default Chapter