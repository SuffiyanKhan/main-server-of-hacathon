import { fetchNewAndUpdateCertificates, processCertificates } from "../services/sendemail.services.js"

const sendEmail=async(req,res)=>{
    try {
        const response = await fetchNewAndUpdateCertificates()
        // console.log(response)
        const responseData = await processCertificates(response)
        
        return res.status(200).json({status:200,message:"success send all emails"})
    } catch (error) {
        return res.status(500).json({status:500,message:"Faild to send email"})
    }
}

export{
    sendEmail
}