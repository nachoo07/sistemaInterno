import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    category: {
        type: String,
        required: true
    },
    attendance: [
        {
            idStudent: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student",
                required: true
            },
            name: {
                type: String,
                required: true
            },
            lastName: {
                type: String,
                required: true
            },
            present: {
                type: Boolean,
                required: true
            }
        }
    ]
}, { timestamps: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;