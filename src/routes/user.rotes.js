import express from 'express';
import { login, logout, updateemail, sendOtpByEmail, updatepassword, saveCertificate, verifyOtp, addPassword } from '../controllers/user.controller.js';
import { certificategenerate,getAllcertificategenerate } from '../controllers/certificate.controller.js';
import { AllCourse, getAllCours, deletecourse } from '../controllers/courses.controllers.js';
import { addStudentsData,getAllStudentsData,dummyaddStudentsData } from '../controllers/addStudents.controllers.js';
import { sendEmail } from '../controllers/sendEmail.controllers.js';
const route = express.Router();

route.post('/saveCertificate', saveCertificate)
route.post('/adminpassword', addPassword)
route.post('/login', login)
route.post('/updatepass', updatepassword)
route.post('/updateemail', updateemail)
route.post('/sendOtp', sendOtpByEmail)
route.post('/verify-otp', verifyOtp)
route.post('/add-Courses', AllCourse)
route.get('/get-allCourses', getAllCours)
route.delete('/delete-Courses/:course_id', deletecourse)
route.post('/addStudents', addStudentsData)
route.post('/dummyaddStudents', dummyaddStudentsData)
route.get('/getAllStudents', getAllStudentsData)
route.post('/generate', certificategenerate)
route.get('/getAllCertificates', getAllcertificategenerate)
route.post('/send-Email',sendEmail)


export default route

