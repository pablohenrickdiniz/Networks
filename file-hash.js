const crypto = require('crypto');
const fs = require('fs');

module.exports = function(file){
    let file_buffer = fs.readFileSync(file);
    let sum = crypto.createHash('sha256');
    sum.update(file_buffer);
    return sum.digest('hex');
};