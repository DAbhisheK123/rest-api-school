import mongoose ,{Schema} from "mongoose";
import { Student } from "./models";

const reportSchema = new mongoose.Schema({
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    timePeriod: {
      type: String,
      required: true
    },
    responseTime: {
      type: Number,
      required: true
    }
},
  
{timestamp:true})


const Report = mongoose.model('Report', reportSchema);

export{  Report };

