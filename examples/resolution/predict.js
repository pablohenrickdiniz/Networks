const fs = require('fs');
const path = require('path');
const Network = require('../../Networks/Network');
const sharp = require('sharp');
const tf = require('@tensorflow/tfjs-node');
const config = require('./config');

module.exports = async function(modelDir,source,target){
    let sourceDir = path.join(config.resolutionsDir,source.join('x'));
    let outputDir = path.join(config.outputsDir,source.join('x')+'_'+target.join('x'));
  
    if(!fs.existsSync(sourceDir)){
        fs.mkdirSync(sourceDir,{recursive:true});
    }

    if(!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir,{recursive:true});
    }
    
    let net = new Network();
    await net.load(modelDir);
    let images = fs.readdirSync(sourceDir).map((f) => path.join(sourceDir,f));

    for(let i = 0; i < images.length;i++){
        let inputImage = images[i];
        let outputImage = path.join(outputDir,path.basename(modelDir)+'.jpeg');
        if(fs.existsSync(outputImage)){
            continue;
        }
        let sharpImage = await sharp(inputImage);
        if(sharpImage === null){
            continue;
        }
        let meta = await sharpImage.metadata();

        let width = meta.width;
        let height = meta.height;
      
        if(height > width){
            let p = width/height;
            height = Math.max(height,target[1]);
            width = height*p;
        }
        else if(height < width){
            let p = height/width;
            width = Math.max(width,target[0]);
            height = width*p;
        }
        else{
            width = height = Math.max(width,target[0]);
        }

        width = parseInt(width);
        height = parseInt(height);
        let input = tf.node.decodeImage(await sharpImage.resize(source[0],source[1],{fit:'fill'}).toBuffer()).expandDims();
        let predict = net.predict(input).squeeze();
        await (await sharp(await tf.node.encodePng(predict))).resize(width,height,{fit:'fill'}).toFile(outputImage);
    }
};