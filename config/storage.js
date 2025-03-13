require('dotenv').config();
const mega = require('megajs');

const storage = new mega.Storage({
    email: process.env.MEGA_EMAIL,
    password: process.env.MEGA_PASSWORD,
    userAgent: 'ExampleApplication/1.0'
});

storage.on('ready', () => {
    console.log('Logged in to MEGA successfully');
});

module.exports = storage;
