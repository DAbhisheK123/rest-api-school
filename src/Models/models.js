import mongoose ,{Schema} from "mongoose";



const studentSchema = new mongoose.Schema({
  rollNo:{
    type:String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  records:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
 }]
});

const Student = mongoose.model('Student', studentSchema);


const reportSchema = new mongoose.Schema({
  student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
  },
  storyRead: {
      type: String,
      required: true
  },
  audioFile: {
      type: String,
      required: true
  },
  text_id:{
    type:String
  },
  apiCallTime: {
      type: Date
  },
  apiResponseTime: {
      type: String
      
  },
  response: {
    type: String
  }
});
reportSchema.pre('remove', async function (next) {
  try {
    await Report.deleteMany({ student: this._id });
    next();
  } catch (error) {
    next(error);
  }
});
const Report = mongoose.model('Report', reportSchema);



export {
  Student,
  Report
};
