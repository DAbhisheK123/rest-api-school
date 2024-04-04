import { Router } from "express";
import {addAudio,addStudent, getLast10Requests, makeRequest, getAllStudents,getAllStudentsWithReports,reuploadAudio} from "../Controllers/register.js"
import { upload } from "../Middlewares/multer.middleware.js";
const studentRouter= Router()
studentRouter.route("/addaudio")
.post(
    upload.fields([
        {
          name: "audiofile",
          maxCount: 1
        }
      ]),
      addAudio)
studentRouter.route("/addstudent").post(addStudent)
studentRouter.route("/list").get(getLast10Requests)
studentRouter.route("/makerequest").post(makeRequest)
studentRouter.route("/reupload").post(upload.fields([
  {
    name: "audiofile",
    maxCount: 1
  }
]),reuploadAudio)
studentRouter.route("/getstudents").get(getAllStudents)
studentRouter.route("/getrecordings").get(getAllStudentsWithReports)
export {studentRouter}
