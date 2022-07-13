const fs = require('fs');
const path = require('path');
const imagesDir = './original';
const outputDir = './output';
const Network = require('../../Networks/Network');
const sharp = require('./sharp');
const tf = require('@tensorflow/tfjs-node');

module.exports = async function(){
    if(!fs.existsSync(imagesDir)){
        fs.mkdirSync(imagesDir,{recursive:true});
    }

    if(!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir,{recursive:true});
    }

    let net = new Network();
    await net.load('./model');
    let images = fs.readdirSync(imagesDir).map((f) => path.join(imagesDir,f));
    
    for(let i = 0; i < images.length;i++){
        let inputImage = images[i];
        let outputImage = path.join(outputDir,path.basename(inputImage));
        let sharpImage = await sharp(inputImage);
        if(sharpImage === null){
            continue;
        }
        let meta = await sharpImage.metadata();

        let width = meta.width;
        let height = meta.height;
      
        if(height > width){
            let p = width/height;
            height = Math.max(height,2048);
            width = height*p;
        }
        else if(height < width){
            let p = height/width;
            width = Math.max(width,2048);
            height = width*p;
        }
        else{
            width = height = Math.max(width,2048);
        }

        width = parseInt(width);
        height = parseInt(height);
        let input = tf.node.decodeImage(await sharpImage.resize(128,128,{fit:'fill'}).toBuffer()).expandDims();
        let predict = net.predict(input).squeeze();
        await (await sharp(await tf.node.encodePng(predict))).resize(width,height,{fit:'fill'}).toFile(outputImage);
    }
};