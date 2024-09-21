const process = require('process');

module.exports = {
    PS5_IP_ADDRESS: process.env.PS5_IP_ADDRESS || '10.0.1.105',
    HOST: process.env.HOST || '0.0.0.0',
    PORT: process.env.PORT || 4242,
};
