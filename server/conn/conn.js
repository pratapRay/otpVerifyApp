const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://raypratap418:loginMernProject@cluster0.8lggjzu.mongodb.net/loginMern?retryWrites=true&w=majority";

async function connect() {
    try {
        const db = await mongoose.connect(mongoURI);
        console.log('Database Connected..!');
        return db;
    } catch (error) {
        console.log(error);
    }
}

module.exports = connect;
