
import db from '../modules/index.js'
import generateOtp from '../utils/randomString.util.js'
const { students: Students } = db

const addStudents = async (payload) => {
    try {
        // const payloadWithRollNumbers = payload.map(student => {
        //     return {
        //         ...student,
        //         rollno: generateOtp()
        //     };
        // });

        // // Insert the modified payload
        // const savedata = await Students.insertMany(payloadWithRollNumbers);
        // return savedata;
        const rollNumber = await generateOtp()
        // const savedata = await Students.insertMany(payload)
        // // const savedata = await Students.insertMany({ payload, rollno: rollNumber })
        const savedata = await Students({ ...payload, rollno: rollNumber })
        // // const saveStudentData = await savedata.insertMany();
        const saveStudentData = await savedata.save();
        // return savedata
        return saveStudentData
    } catch (error) {
        throw error
    }
}

const dummaddStudents = async (payload) => {
    try {
        const payloadWithRollNumbers = payload.map(student => {
            return {
                ...student,
                rollno: generateOtp()
            };
        });

        // Insert the modified payload
        const savedata = await Students.insertMany(payloadWithRollNumbers);
        return savedata;
        // const rollNumber = await generateOtp()
        // // const savedata = await Students.insertMany(payload)
        // // // const savedata = await Students.insertMany({ payload, rollno: rollNumber })
        // const savedata = await Students({ ...payload, rollno: rollNumber })
        // // // const saveStudentData = await savedata.insertMany();
        // const saveStudentData = await savedata.save();
        // // return savedata
        // return saveStudentData
    } catch (error) {
        throw error
    }
}

const fetchAllStudentsData = async()=>{
    try {
        const response = await Students.find({}).exec();
        return response
    } catch (error) {
        throw error
    }
}

export {
    addStudents,
    fetchAllStudentsData,
    dummaddStudents
}