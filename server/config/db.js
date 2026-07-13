import dns from "dns"
dns.setServers(["8.8.8.8", "8.8.4.4"])

import mongoose from "mongoose"

const connectDB=async()=>{
    try{
        const conn=await mongoose.connect(process.env.MONGO_URI,{serverSelectionTimeoutMS:5000
        })
        console.log("MongoDB connected")
    } catch (error) {
        console.error("Error connecting to MongoDB")
        process.exit(1)
    }
}
export default connectDB