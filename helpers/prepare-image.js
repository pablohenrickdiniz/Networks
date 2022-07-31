const sharp = require('sharp');

module.exports = async function(img){
    let buffer =  await img
        .clone()
        .png()
        .ensureAlpha()
        .toBuffer();

    return sharp(buffer);
};