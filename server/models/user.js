import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    role : {
        type: String,
        enum: ["candidate", "admin"],
        default: "candidate"
    },
    credits : {
        type: Number,
        default: 100
    },
},{timestamps : true})

const userModel = mongoose.model("User", userSchema)
export default userModel
