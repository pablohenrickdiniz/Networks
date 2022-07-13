const fs = require('fs');
const path = require('path');
const Network = require('../../Networks/Network');
const highResDir = '../resolution/high-resolution';
const lowResDir = '../resolution/low-resolution';
const outputDir = '../resolution/output';
const tf = require('@tensorflow/tfjs-node');
const predict = require('./predict');

(async function(){
    while(true){
        if(!fs.existsSync(highResDir)){
            fs.mkdirSync(highResDir,{recursive:true});
        }
    
        if(!fs.existsSync(lowResDir)){
            fs.mkdirSync(lowResDir,{recursive:true});
        }
    
        if(!fs.existsSync(outputDir)){
            fs.mkdirSync(outputDir,{recursive:true});
        }
    
        let net = new Network({
            inputShape:[128,128,3],
            outputShape:[2048,2048,3],
            layers:[
                {type:'conv2d',filters:3},
                {type:'maxPooling2d'},
                {type:'upSampling2d'},
                {type:'conv2d',filters:3},
                {type:'maxPooling2d'},
                {type:'upSampling2d'},
                {type:'conv2d',filters:3},
                {type:'maxPooling2d'},
                {type:'upSampling2d'},
                {type:'conv2d',filters:3},
                {type:'maxPooling2d'},
                {type:'upSampling2d'}
            ],
            batchSize:4,
            optimizer:'adam'
          //  loss:'sgd'
        });
        
        await net.load('./model');
    
        let inputs = fs
            .readdirSync(lowResDir)
            .filter((f) => fs.existsSync(path.join(highResDir,f)))
            .map((f) => path.join(lowResDir,f))
            .sort(() => Math.random() - 0.5)
            .slice(0,16);
    
        let outputs = inputs.map((f) => path.join(highResDir,path.basename(f)));
        let trainingData = [];
    
        for(let i = 0; i < inputs.length;i++){
            let input = inputs[i];
            let output = outputs[i];
            trainingData.push({
                input:tf.node.decodeImage(fs.readFileSync(input)),
                output:tf.node.decodeImage(fs.readFileSync(output))
            });
        }
    
        await net.train(trainingData,10,async function(epoch,epochs,loss,acc){
            console.log(`${epoch}/${epochs} loss:${loss}, accuracy:${acc}`);
        });
    
        await net.save('./model');
        //await predict();
    }
})();