const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

// const connectDB2 = () => {
//     return new Promise((resolve, reject) => {
//         if (db) {
//             resolve(mongoose.connect(db));
//         }
//         reject(new Error('Connecting is failed'));;
//     })
// }

const connectDB = async () => {
    try {
        await mongoose.connect(db)

        console.log('MongoDB connected...')
    } catch(err) {
        console.error(err.message);
        // Exit process with failure
        process.exit(1);
    }
}

module.exports = connectDB;