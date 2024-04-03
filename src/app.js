import  express  from "express";
import cookieParser from 'cookie-parser'
import cors from 'cors'



const app=express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("Public"))
app.use(cookieParser())

import {studentRouter} from "./routes/studentRoutes.js"


app.use("/api/v1/student", studentRouter)

app.get('/',(req,res,next)=>{
    res.status(200).json({
      message:'bad request'
    })
  })
  


export default app