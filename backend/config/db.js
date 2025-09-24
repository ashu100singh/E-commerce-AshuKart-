const mongoose = require("mongoose")

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("DB Connected Suceessfully")
    } catch(error){
        console.error("DB Connection Failed", error)
        process.exit(1)
    }
}

module.exports = connectDB