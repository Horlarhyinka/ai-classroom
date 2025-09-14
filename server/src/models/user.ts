import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
    theme: { type: String, enum: ['light', 'dark'], default: 'light'},

})

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trin: true },
    email: { type: String, unique: true, trim: true, required: true},
    setting: settingSchema,
    picture: { type: String, },
    
}, { timestamps: true })

const User = mongoose.models.user ?? mongoose.model('user', userSchema)

export default User;