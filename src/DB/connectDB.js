import mongoose from 'mongoose'

const  connectDB= async ()=>{
    try{
    await mongoose.connect(`${process.env.MONGODB_URI}`)
    console.log("database connected ")
    }
    catch(err){
        console.log(process.env.PORT)
        console.log(err)
    }
}
export default connectDB