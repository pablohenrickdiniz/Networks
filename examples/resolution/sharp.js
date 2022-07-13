const sharp = require('sharp');
const jimp = require('jimp');

module.exports = async function(source){
    if(typeof source === 'string'){
        try{
            let image = await jimp.read(source);
            let buffer = await image.getBufferAsync('image/jpeg');
            return sharp(buffer).jpeg();
        }
        catch(e){

        }
        return null;
    }
    return sharp(source).jpeg();
};