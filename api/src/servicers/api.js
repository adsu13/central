const axios = require('axios');

const instance = axios.create({
    baseURL: 'http://localhost',
});

module.exports = instance;