const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');
const prepare = require('../../helpers/prepare-image');

module.exports = async function(image,model){
    let [modelHeight, modelWidth] = model.options.inputShape;
    let meta = await image.metadata();
    let width = meta.width;
    let height = meta.height;
    let resizedBuffer = await (await prepare(image.resize(modelHeight,modelWidth,{fit:'fill'}))).toBuffer();
    let input = tf.node.decodeImage(resizedBuffer,4).expandDims();
    let predict = model.predict(input).squeeze();
    let outputBuffer = await tf.node.encodePng(predict);
    return await prepare(sharp(outputBuffer).resize(width,height,{fit:'fill'}));
};