const axios = require('axios');

const instance = axios.create({
    baseURL: 'http://localhost:8080',
});

module.exports = instance;