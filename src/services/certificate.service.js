import app from '../../server.js';
import pLimit from 'p-limit';
import puppeteer from "puppeteer";
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cloudinary from 'cloudinary';
import db from '../modules/index.js'


const { certificate: Certificate, students: Students } = db


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// // Ensure the temp directory exists
const tempDir = path.join(__dirname, 'temp/certificates');
const pdfDir = path.join(__dirname, 'tem/pdfs');




cloudinary.config({
    cloud_name: 'dandp2osc',
    api_key: 734246468235897,
    api_secret: 'xC6A21_VzEcGj0LtMvT3D5WfuyA'
});


// const getAllDataAccordingToCondition = async (batchNo, course) => {
//     try {
//         console.log("students",batchNo, course)
//         const students = await Students.find({ batchNo: batchNo,course: course }).exec();
//         console.log(students)
//         // return students;
//     } catch (error) {
//         throw error.message;
//     }
// }

const getAllDataAccordingToCondition = async (batchNo, course) => {
    try {
        const students = await Students.find({ batchNo: batchNo, course: course }).exec();
        console.log('Retrieved Students:', students);
        return students;
    } catch (error) {
        console.error('Error fetching students:', error);
        throw error.message;
    }
}

// async function generateCertificates(dataArray) {
//     const totalDataLength = dataArray.length;
//     console.log(totalDataLength)
//     const limit = pLimit(25); 
//     // const limit = pLimit(10); 
//     const browser = await puppeteer.launch({
//         args: ['--no-sandbox', '--disable-setuid-sandbox'],
//         protocolTimeout: 240000,
//         headless: true,
//         defaultViewport: null
//     });
//     let savedCertificatesCount = 0;

//     async function processCertificate(data) {
//         const page = await browser.newPage();
//         page.setDefaultNavigationTimeout(300000); 

//         try {
//             await page.goto('about:blank', { waitUntil: 'networkidle2' });

//             const qrCodeUrl = await generateQRCode(data);
//             const certificateHtml = await generateCertificateHtml(data, qrCodeUrl);
//             await page.setContent(certificateHtml, { waitUntil: 'domcontentloaded' });
//             const pdfBuffer = await page.pdf({ format: 'A4' });

//             const fileName = `${uuidv4()}.pdf`;
//             const filePath = path.join(tempDir, fileName);
//             console.log(filePath)
//             await savePdfToFile(pdfBuffer, filePath);

//             const uploadResult = await cloudinary.v2.uploader.upload(filePath, { resource_type: 'raw' });
//             await saveCertificateToDB(data, uploadResult.secure_url);

//             fs.unlinkSync(filePath);
//             savedCertificatesCount++;
//         } catch (error) {
//             console.error(`Error generating PDF for student: ${data.name}:`, error);
//         } finally {
//             await page.close();
//         }
//     }

//     const tasks = dataArray.map(data => limit(() => processCertificate(data)));
//     await Promise.all(tasks);

//     await browser.close();
//     console.timeEnd('Total Time'); 

//     return savedCertificatesCount;
const cleanupTempFolder = () => {
    fs.readdir(tempDir, (err, files) => {
        if (err) {
            console.error('Error reading temp directory:', err);
            return;
        }

        for (const file of files) {
            const filePath = path.join(tempDir, file);
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
        }

        console.log('Temporary folder cleaned up.');
    });
};// }

async function generateCertificates(dataArray) {
    const totalDataLength = dataArray.length;
    console.log('Total Data Length:', totalDataLength);

    const limit = pLimit(25);
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        protocolTimeout: 240000,
        headless: true,
        defaultViewport: null
    });
    let savedCertificatesCount = 0;

    async function processCertificate(data) {
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(300000);

        try {
            await page.goto('about:blank', { waitUntil: 'networkidle2' });

            const qrCodeUrl = await generateQRCode(data);

            const certificateHtml = await generateCertificateHtml(data, qrCodeUrl);

            await page.setContent(certificateHtml, { waitUntil: 'domcontentloaded' });
            const pdfBuffer = await page.pdf({ format: 'A4' });

            const fileName = `${uuidv4()}.pdf`;
            const filePath = path.join(tempDir, fileName);

            await savePdfToFile(pdfBuffer, filePath);

            const uploadResult = await cloudinary.v2.uploader.upload(filePath, {  upload_preset: 'my_preset' });

            await saveCertificateToDB(data, uploadResult.secure_url);
            console.log('Saved to DB');

            fs.unlinkSync(filePath);
            savedCertificatesCount++;
        } catch (error) {
            console.error(`Error generating PDF for student: ${data.name}:`, error);
        } finally {
            await page.close();
        }
    }

    const tasks = dataArray.map(data => limit(() => processCertificate(data)));
    await Promise.all(tasks);

    await browser.close();
    console.timeEnd('Total Time');

    return savedCertificatesCount;
}

async function generateCertificateHtml(data, qrCodeUrl) {
    return new Promise((resolve, reject) => {
        console.log("data", data.name)
        const student_Data={
            name:data.name,
            course:data.course,
            // date:data.date,
            batchNo:data.batchNo,
            rollno:data.rollno
        }

        app.render('certificate', { ...student_Data, qrCodeUrl }, (err, html) => {
            if (err) {
                console.error('Error rendering certificate:', err);
                reject(err);
            } else {
                resolve(html);
            }
        });
    });
}

async function generateQRCode(data) {
    const url = `${encodeURIComponent(data.name)} Verified by Saylani It Mass Training which enrolled in ${encodeURIComponent(data.course)} course from ${encodeURIComponent(data.date)}`;
    return QRCode.toDataURL(url);
}

async function savePdfToFile(pdfBuffer, filePath) {
  
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, pdfBuffer, (err) => {
            if (err) {
                console.error('Error saving PDF file:', err);
                reject(err);
            } else {
                resolve(filePath); 
            }
        });
    });
}

async function saveCertificateToDB(data, certificateUrl) {
    try {
        console.log(certificateUrl)
        // const certificates = new Certificate({
        //     name: data.name,
        //     course: data.course,
        //     date: data.date,
        //     certificateUrl: certificateUrl,
        //     email: data.email,  
        //     cnic: data.cnic,   
        //     batchNo: data.batchNo,
        //     rollno: data.rollno 
        // });
        // await certificates.save();
        console.log(`Certificate saved to MongoDB for ${data.name}`);
    } catch (error) {
        console.error('Error saving certificate to MongoDB:', error);
        throw error;
    }
}

const getAllCertificatesData=async()=>{
    try {
        const response = await Certificate.find({}).exec();
        return response
    } catch (error) {
        throw error
    }
}




export {
    generateCertificates,
    getAllDataAccordingToCondition,
    getAllCertificatesData,
    cleanupTempFolder
}