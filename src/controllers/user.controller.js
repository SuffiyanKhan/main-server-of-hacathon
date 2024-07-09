import jwt from 'jsonwebtoken';
import { UpdateUserByEmail, createStudentsData, saveAdminPassword, deleteTokensByUID, findByEmail, saveToken, findById, findByCnic } from "../services/user.service.js"
import { compareHash, createHash } from "../utils/hah.utils.js"
import { serverConfig } from '../configs/server.config.js';
import sendEmail from '../services/mail.service.js';
import generateOtp from '../utils/randomString.util.js';

const saveCertificate = async (req, res) => {
    try {
        const { rollno, cnic, email, certificateUrl } = req.body
        const user = await findByCnic(cnic)
        if (user) {
            return res.send("CNIC already exists")
        }
        // const hashPassword = await createHash(password)
        const payload = {
            rollno,
            cnic,
            email,
            certificateUrl,
            // password: hashPassword
        }
        const saveUser = await createStudentsData(payload)
        return res.status(200).send({ status: 200, message: "successfully", user: saveUser })

    } catch (error) {
        return res.status(400).send({ status: 401, message: error.message })
    }
}

const addPassword = async (req, res) => {
    try {
        const { password, email, otp } = req.body
        const hashPassword = await createHash(password)
        const savepass = await saveAdminPassword(hashPassword, email, otp)
        return res.status(200).send({ status: 200, message: "successfully", })
    } catch (error) {
        console.log(error)
    }
}

// const login = async (req, res) => {
//     try {
//         const { id, password } = req.body;

//         const saveUser = await findById(id)
//         if (!saveUser) return res.status(400).send("Invalid credential")

//         const passwordMatch = await compareHash(password, saveUser.password)
//         if (!passwordMatch) return res.status(500).json({ success: false, message: 'invalid creds', data: null })

//         const token = jwt.sign({ email: saveUser.email, username: saveUser.username }, serverConfig.secretKey, { expiresIn: '1h' })
//         delete saveUser.password
//         // const generateToken = await saveToken({ token, user: saveUser.id })
//         return res.status(200).send({ status: 200, message: "successfully", user: saveUser, token: token })
//     } catch (error) {
//         return res.status(400).send({ status: 400, message: error.message })

//     }
// }

const login = async (req, res) => {
    try {
        const { id, password } = req.body;

        const saveUser = await findById(id);
        if (!saveUser) return res.status(400).send("Invalid credentials");

        const passwordMatch = await compareHash(password, saveUser.password);
        if (!passwordMatch) return res.status(500).json({ success: false, message: 'Invalid credentials', data: null });

        const token = jwt.sign({ email: saveUser.email, username: saveUser.username }, serverConfig.secretKey, { expiresIn: '1h' });
        
        // Remove password field from saveUser object
        delete saveUser.password;

        return res.status(200).send({ status: 200, message: "Successfully logged in", user: saveUser, token: token });
    } catch (error) {
        console.log("ERROR",error.message)
        return res.status(400).send({ status: 400, message: error.message });
    }
}

const updateemail = async (req, res) => {
    try {
        const { email, newEmail } = req.body
        const saveUser = await findByEmail(email)
        if (!saveUser) return res.status(400).send("Invalid credential")
        saveUser.email = newEmail
        saveUser.save()
        return res.status(200).json({ status: 200, message: "success" })
    } catch (error) {
        return res.status(400).json({ status: 400, message: error.message })
    }
}


const updatepassword = async (req, res) => {
    try {
        const { id, newpassword } = req.body
        const saveUser = await findById(id)
        if (!saveUser) return res.status(400).send("Invalid credential")
        const hashPassword = await createHash(newpassword)
        saveUser.password = hashPassword
        saveUser.save()
        return res.status(200).json({ status: 200, message: "success" })
    } catch (error) {
        return res.status(400).json({ status: 400, message: error.message })
    }
}

const sendOtpByEmail = async (req, res) => {
    try {
        const { email } = req.body
        const getEmail = await findByEmail(email);
        if (!getEmail) return res.status(400).json({ status: 400, message: "Invalid Credential" });
        const otp = await generateOtp();
        console.log(getEmail)
        getEmail.otp = otp;
        getEmail.save()
        await sendEmail({
            to: getEmail.email,
            subject: 'Your otp',
            text: `Your otp is ${otp}`
        }).then(res => console.log(`Success sending email to ${getEmail.email}`))
            .catch(err => console.log(`Error sending email to ${getEmail.email}`))
        return res.status(200).json({ status: 200, message: "success" })
    } catch (error) {
        return res.status(400).json({ status: 400, message: error.message })
    }
}

const logout = async (req, res) => {
    try {
        const { uid } = req.body
        const logoutUser = await deleteTokensByUID(uid)
        if (logoutUser.deletedCount === 0) {
            return res.status(500).json({ success: false, message: 'already logged in', data: null })
        }

        return res.status(200).json({ success: true, message: 'succesfully logged out', data: null })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'something went wrong', data: null })
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body

        const user = await findByEmail(email)
        if (!user) return res.send('unprocessible request')

        if (user.otp !== otp) return res.send('invalid otp')

        // const response = await UpdateUserByEmail(user.email)
       delete user.otp ;
        user.save()
        return res.send("otp verified")
    } catch (error) {
        console.log("Something went wrong", error.message)
        return res.send("Something went wrong")
    }
}


export {
    saveCertificate,
    addPassword,
    login,
    updatepassword,
    updateemail,
    sendOtpByEmail,
    logout,
    verifyOtp,
    
}
