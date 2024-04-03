import app from "./app.js"
import dotenv from 'dotenv'
import  connectDB  from './DB/connectDB.js'
dotenv.config({
    path:"./env"
})
connectDB()
.then(()=>{
    console.log(`server started at port ${process.env.PORT || 3000}`)
})
.catch(()=>{
    console.log("DB connection Failed")
})


app.listen(process.env.PORT,()=>{
    console.log("server start")
})