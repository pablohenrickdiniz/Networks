const fs = require('fs');
const path = require('path');
const Network = require('../../Networks/Network');
const sharp = require('sharp');
const config = require('./config');
const predict_model = require('./predict_model');
const read = require('../../helpers/read-images');

module.exports = async function(modelDir,source,target,index,examples){
    index = index || '';
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
    let images = read(sourceDir);
    if(examples !== undefined){
        images  = images.slice(0,examples);
    }
    for(let i = 0; i < images.length;i++){
        let inputImage = images[i];
        let outputImage = path.join(outputDir,String(index).padStart(6,'0')+'_'+path.basename(modelDir)+path.basename(inputImage));
        let sharpImage = await sharp(inputImage);
        let output = await predict_model(sharpImage,net);
        await output.toFile(outputImage)
    }
};