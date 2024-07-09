import mongoose from "mongoose";
// import generateOtp from "../utils/randomString.util.js";
// import sendEmail from "../services/mail.service.js";

const { Schema } = mongoose;

const UserSchema = new Schema({
    name: { type: String, required: true },
    course: { type: String, required: true },
    date: { type: Date, required: true },
    certificateUrl: { type: String, required: true },
    email: { type: String, required: true },
    cnic: { type: String, default: null },
    batchNo: { type: String, default: null },
    rollno:{type:String,default:null },
    isEmail: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

// UserSchema.pre('save', function (next) {
//     if (!this.otp) {
//         this.otp = generateOtp()
//         sendEmail({
//             to: this.email,
//             subject: 'Your otp',
//             text: `Your otp is ${this.otp}`
//         }).then(res => console.log(`Success sending email to ${this.email}`))
//             .catch(err => console.log(`Error sending email to ${this.email}`))
//     }
//     next()
// })
const Certificatie = mongoose.model('Certificate', UserSchema);

export default Certificatie;

