import { cleanupTempFolder, generateCertificates, getAllCertificatesData, getAllDataAccordingToCondition } from '../services/certificate.service.js';

const certificategenerate = async (req, res) => {
    try {
        const { batchno, course } = req.body;

        // Assuming getAllDataAccordingToCondition and generateCertificates are defined elsewhere
        const response = await getAllDataAccordingToCondition(batchno, course);
        const pdfFileNames = await generateCertificates(response);

        // Respond with 200 status and appropriate messages based on progress
        if (pdfFileNames.length > 0) {
            return res.status(200).send({ message: "Task is in progress. Certificates are being generated." });
        } else {
            await cleanupTempFolder()
            return res.status(200).send({ message: "Task is complete. Certificates generated successfully.", pdfFileNames });
        }
    } catch (error) {
        console.error('Error generating certificates:', error);
        return res.status(500).send({ message: 'Error generating certificates', ERROR: error.message });
    }
}

const getAllcertificategenerate = async (req, res) => {
    try {
        const response = await getAllCertificatesData()
        return res.status(200).json({ status: 200, message: "success", data: response })
    } catch (error) {
        return res.status(500).json({ message: "server error", status: 500 })
    }
}

export {
    certificategenerate,
    getAllcertificategenerate
}