import {asyncHandler} from "../Utilities/asyncHandler.js"

import {ApiError} from "../Utilities/apiError.js"
import {Report, Student} from "../Models/models.js"
import {ApiResponse} from "../Utilities/apiResponse.js"
import axios  from "axios"
import fs from "fs"

const hitApi=(url,text_id)=>{
    const apiUrl = 'https://505a4vjhyk.execute-api.ap-south-1.amazonaws.com/prod/scoring';

    return new Promise((resolve, reject) => {
        const jsonData = {
            s3_url: url,
            reference_text_id:text_id
        };
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key':process.env.API_KEY

        };

        axios.post(apiUrl, jsonData, { headers })
            .then(response => {
                resolve(response.data); 
            })
            .catch(error => {
                reject(error); 
            });
    });
}

const uploadToAWS = (filePath) => {
    return new Promise((resolve, reject) => {
        const fileData = fs.readFileSync(filePath);

        const apiUrl = 'https://rorbdox8zg.execute-api.ap-south-1.amazonaws.com/alpha/upload/';

        const audioBase64 = fileData.toString('base64');
        const jsonData = {
            audioFile: `data:audio/x-m4a;base64,${audioBase64}`
        };
        
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        fs.unlinkSync(filePath)
        axios.post(apiUrl, jsonData, { headers })
            .then(response => {
                resolve(response.data.s3Url); // Resolve with the S3 URL
            })
            .catch(error => {
                reject(error); // Reject with the error
            });
        
    });
};
const addStudent = asyncHandler(async (req, res) => {
    try {
      const { name, rollNo } = req.body;
  
      if (!name || !rollNo) {
          throw new ApiError(400, "All fields are required");
      }
  
      const student = await Student.findOne({ rollNo });
  
      if (student) {
          throw new ApiError(400, "Student with the same roll number already exists");
      }
  
      const newStudent = await Student.create({
          name,
          rollNo
      });
  
      return res.status(201).json(
          new ApiResponse(200, newStudent, "Student registered Successfully")
      );
    } catch (error) {
        return res.status(error.statusCode || 500).json({
          error: error.message // Send the error message in the response body
        });
      }
      
  });
  
  
  const addAudio = asyncHandler(async (req, res) => {
    try {
      const { rollNo, storyRead="Dam" } = req.body;
      if (!rollNo){
        throw new ApiError(400, "roll no needed");
      }
      const student = await Student.findOne({ rollNo });
  
      if (!student) {
        throw new ApiError(400, "Student not found");
      }
      const audiopath=req.files?.audiofile[0]?.path
    
      let s3_url;
      try {
          s3_url = await uploadToAWS(audiopath);
      } catch (error) {
          throw new ApiError(500, "Failed to upload audio to AWS S3");
      }

      const report = await Report.create({
        student: student._id,
        audioFile:s3_url,
        storyRead:storyRead
      });
      
      student.records.push(report._id)
      await student.save();
      
  
      return res.status(201).json(
          new ApiResponse(200, report, "audio added success fully")
      )
    } catch (error) {
      res.status(error.statusCode || 500).json({
          success: false,
          error: error.message || "Server error"
      });
    }
  });
  const reuploadAudio=asyncHandler(async(req,res)=>{
    try {
        const { report_id } = req.body;
        const report = await Report.findById(report_id);
        if (!report) {
            throw new ApiError(400, "Report does not exist");
        }
        const audiopath=req.files?.audiofile[0]?.path
        let s3_url;
        try {
            s3_url = await uploadToAWS(audiopath);
        } catch (error) {
            throw new ApiError(500, "Failed to upload audio to AWS S3");
        }
        report.audioFile=s3_url
        report.save()
        return res.status(201).json(
            new ApiResponse(200, report, "audio reuploaded successfully")
        )

    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || "failed"
        });
    }
  })
  const makeRequest = asyncHandler(async (req, res) => {
    try {
        const { report_id } = req.body;
        
        const report = await Report.findById(report_id);
        if (!report) {
            throw new ApiError(400, "Report does not exist");
        }

        const s3_url = report.audioFile;
        const text_id = "EN-OL-RC-247-1";
        report.text_id = text_id;

        const startTime = new Date();
        let response;
        try {
            response = await hitApi(s3_url, text_id);
        } catch (error) {
           
            if (error.response && error.response.data && error.response.data.errorMessage) {
               
                throw new ApiError(400, error.response.data.errorMessage);
            } else {
                
                throw new ApiError(500, "API call failed");
            }
        }

        
        const endTime = new Date();
        const responseTime = endTime - startTime;

        report.apiCallTime = startTime; // Assigning a Date object directly
        report.apiResponseTime = responseTime;
        report.response = JSON.stringify(response);
        
        await report.save();

        return res.status(201).json(
            new ApiResponse(200, { report, response }, "Report created successfully")
        );
    } catch (error) {
        
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || "Server error"
        });
    }
});

  const getLast10Requests = asyncHandler(async (req, res) => {
    try {
        const requests = await Report.find({ response: { $exists: true, $ne: null } })
            .populate('student')
            .exec();

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error || "Server error"
        });
    }
});


  
  const getRequestByName = asyncHandler(async (req, res) => {
    try {
      const { studentName } = req.body;
      const requests = await Report.find({}).populate({
          path: 'student',
          match: { name: studentName }
      }).sort({ apiCallTime: -1 }).limit(10).exec();
  
      res.status(200).json({
          success: true,
          data: requests
      });
    } catch (error) {
      res.status(500).json({
          success: false,
          error:error || "Server error"
      });
    }
  });
  
  const getAllStudents = asyncHandler(async (req, res) => {
    try {
      const students = await Student.find({}, 'rollNo name');
      res.json(students);
    } catch (error) {
      res.status(500).json({
          success: false,
          error: error || "Server error"
      });
    }
  });
  const getAllStudentsWithReports = asyncHandler( async (req, res) => {
    try {
        const studentsWithReports = await Student.find().populate('records');
        const transformedData = [];
        studentsWithReports.forEach(student => {
            const { rollNo, name, records } = student;
            if (records.length > 0) {
                records.forEach(record => {
                    transformedData.push({ rollNo, name, record });
                });
            } else {
                transformedData.push({ rollNo, name, records });
            }
        });
        res.json(transformedData);;
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error || "Server error"
        });
    }
});




  
   
  export {
    reuploadAudio,
    getAllStudents,
    makeRequest,
    addStudent,
    addAudio,
    getLast10Requests,
    getAllStudentsWithReports,
    getRequestByName
  }
  