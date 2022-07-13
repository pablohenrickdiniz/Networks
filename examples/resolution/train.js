const fs = require('fs');
const path = require('path');
const Network = require('../../Networks/Network');
const generateImage = require('../perlin-noise/generate-image');
const highResDir = '../resolution/high-resolution';
const lowResDir = '../resolution/low-resolution';
const outputDir = '../resolution/output';
const tf = require('@tensorflow/tfjs-node');
const { model } = require('@tensorflow/tfjs-node');

(async function(){
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
        outputShape:[2056,2056,3],
        layers:[
            {type:'conv2d',filters:8}
        ]
    });

    net.summary();
    process.exit();

    let inputs = fs
        .readdirSync(lowResDir)
        .filter((f) => fs.existsSync(path.join(highResDir,f)))
        .map((f) => path.join(lowResDir,f));

    let outputs = inputs.map((f) => path.join(highResDir,path.basename(f)));
    let trainingData = [];

    for(let i = 0; i < inputs.length;i++){
        let input = inputs[i];
        let output = outputs[i];
        await net.train([
            {
                input:tf.node.decodeImage(fs.readFileSync(input)).arraySync(),
                output:tf.node.decodeImage(fs.readFileSync(output)).arraySync()
            }
        ],10,async function(epoch,epochs,loss,acc){
            console.log(`${epoch}/${epochs} loss:${loss}, accuracy:${acc}`);
        });
    }

    console.log(trainingData.length);
    process.exit();
})();