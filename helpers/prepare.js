const sharp = require('sharp');

module.exports = async function prepare(img){
    let buffer =  await img
        .clone()
        .png()
        .ensureAlpha()
        .toBuffer();

    return sharp(buffer);
};