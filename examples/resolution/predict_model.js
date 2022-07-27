const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');

module.exports = async function(image,model){
    let [modelHeight, modelWidth] = model.options.inputShape;
    let meta = await image.metadata();
    let width = meta.width;
    let height = meta.height;
    // if(height > width){
    //     let p = width/height;
    //     height = Math.max(height,target[1]);
    //     width = height*p;
    // }
    // else if(height < width){
    //     let p = height/width;
    //     width = Math.max(width,target[0]);
    //     height = width*p;
    // }
    // else{
    //     width = height = Math.max(width,target[0]);
    // }
    // width = parseInt(width);
    // height = parseInt(height);
    let input = tf.node.decodeImage(await  image.resize(modelHeight,modelWidth,{fit:'fill'}).ensureAlpha().toBuffer(),4).expandDims();
    let predict = model.predict(input).squeeze();
    return sharp(await tf.node.encodePng(predict)).resize(width,height,{fit:'fill'});
};