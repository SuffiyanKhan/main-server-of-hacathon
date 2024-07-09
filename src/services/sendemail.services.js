import { PDFDocument } from 'pdf-lib';
import puppeteer from "puppeteer";
import fs from 'fs';
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import db from '../modules/index.js'


const { certificate: Certificate, students: Students } = db

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// // Ensure the temp directory exists
const tempDir = path.join(__dirname, 'temp/certificates');
const pdfDir = path.join(__dirname, 'tem/pdfs');

const startRealTimeTracking = async () => {
    try {
        const pipeline = [
            { $match: { 'fullDocument.courseIsComplete': true } }
        ];

        const changeStream = Certificate.watch(pipeline);

        return new Promise((resolve, reject) => {
            changeStream.on('change', (change) => {
                console.log('Real-time change:', change);
                resolve(change);
            });

            changeStream.on('error', (error) => {
                console.error('Change stream error:', error);
                reject(error);
            });
        });
    } catch (error) {
        console.error('Error setting up real-time tracking:', error.message);
        throw new Error('Real-time tracking setup failed');
    }
};

async function fetchNewAndUpdateCertificates() {
    try {
        const certificates = await Certificate.find({ isEmail: false });
        const changeStream = Certificate.watch();
        changeStream.on('change',async(changes)=>{
            if (changes.operationType === 'insert' || changes.operationType === 'update') {
                console.log()
            }
            console.log("CHANGES IN DATABASE",changes)
        })
        console.log(certificates.length)
        return certificates
        // console.log(changeStream)
        // await processCertificates(certificates);
    } catch (error) {
        console.error('Error fetching certificates:', error);
    }
}

// // // Function to process certificates
async function processCertificates(certificates) {
    for (const certificate of certificates) {
        // console.log(certificate.certificateUrl , certificate.isEmail)
        if (certificate.certificateUrl && !certificate.isEmail) {
            // console.log(certificate)
            await sendCertificateEmail(certificate);
        }
    }
}

async function sendCertificateEmail(certificate) {
    try {
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        if (!certificate.certificateUrl.startsWith('http')) {
            throw new Error(`Invalid certificate URL: ${certificate.certificateUrl}`);
        }

        if (!global.browser) {
            global.browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                protocolTimeout: 240000,
                headless: true,
                defaultViewport: null
            });
        }

        const page = await global.browser.newPage();
        await page.goto(certificate.certificateUrl, { waitUntil: 'networkidle2' });

        const pdfBuffer = await page.pdf({ format: 'A4' });
        await page.close(); // Page close after PDF generation

        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pdfBytes = await pdfDoc.save();
        const pdfPath = path.join(tempDir, `${certificate.name}.pdf`);
        fs.writeFileSync(pdfPath, pdfBytes);

        // const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        // const sender = { email: "suffiyanahmed804092@gmail.com", name: "Saylani IT Mass Training" };
        // const receiver = [{ email: certificate.email }];

        // const sendEmail = await apiInstance.sendTransacEmail({
        //     sender,
        //     to: receiver,
        //     subject: "Your Certificate",
        //     textContent: "Please find your certificate attached.",
        //     htmlContent: "<p>Please find your certificate attached.</p>",
        //     attachment: [{
        //         content: pdfBytes.toString('base64'),
        //         name: `${certificate.name}.pdf`
        //     }]
        // });

        // certificate.isEmail = true;
        // await certificate.save();
        // fs.unlinkSync(pdfPath);
        // console.log(`Certificate email sent to ${certificate.email}`);
    } catch (error) {
        console.error('Error sending certificate email:', error.message);
    }
}




export{
    fetchNewAndUpdateCertificates,
    processCertificates,
    startRealTimeTracking,
}