const fs = require('fs');
const path = require('path');
const config = require('./config');
const Network = require('../../Networks/Network');
const predict = require('./predict');

module.exports = async function(source,target){
    let modelStart = source.join('x')+'_'+target.join('x');
    let modelDirs = fs.readdirSync(config.modelsDir)
        .filter((d) => d.startsWith(modelStart))
        .map((d) => path.join(config.modelsDir,d))
        .map(function(d){
            return {
                modelDir: d 
            };
        });

    for(let i = 0; i < modelDirs.length;i++){
        let modelDir = modelDirs[i];
        if(fs.existsSync(modelDir.modelDir)){
            let net = new Network();
            await net.load(modelDir.modelDir);
            modelDir.loss = net.metrics.loss;
            modelDir.acc = net.metrics.acc;
        }
    }
  
    modelDirs = modelDirs.sort(function(ia,ib){
        let a = ia.loss === null?0:ia.loss;
        let b = ib.loss === null?0:ib.loss;
        let diff = a-b;
        if(diff === 0){
            a = ia.acc === null?0:ia.acc;
            b = ib.acc === null?0:ib.acc;
            diff = b-a;
        }
        return diff;
    }).map(function(d){
        return d.modelDir;
    });
   
    // let outputDir = path.join(config.outputsDir,source.join('x')+'_'+target.join('x'));
    // if(fs.existsSync(outputDir)){
    //     let images = fs.readdirSync(outputDir).map((f) => path.join(outputDir,f));
    //     for(let i = 0; i < images.length;i++){
    //         fs.unlinkSync(images[i]);
    //     }
    // }
 
    for(let i = 0; i < modelDirs.length;i++){
        await predict(modelDirs[i],source,target,i);
    }
};