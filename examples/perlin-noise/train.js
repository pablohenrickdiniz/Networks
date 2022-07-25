const Network = require('../../Networks/Network');
const NetworkGenerator =  require('../../Networks/NetworkGenerator');
const path = require('path');
const conf = require('./config');
const generateTrainingData = require('./generate-training-data');
const generateImage = require('./generate-image');
const epochs = 1000;
const fs = require('fs');

function getModelName(c){
    return c.layers.map(function(l){
        return [
            l.type,
            l.units,
            l.filters,
            l.activation
        ].filter((f) => f !== undefined).join('_');
    })
    .filter((f) => f.length > 0)
    .concat([
        c.loss,
        c.optimizer
    ].filter((f) => f !== undefined))
    .join('_');
}


(async function(){
    if(!fs.existsSync(conf.outputsDir)){
        fs.mkdirSync(conf.outputsDir,{recursive: true});
    }

    if(!fs.existsSync(conf.modelsDir)){
        fs.mkdirSync(conf.modelsDir,{recursive: true});
    }

    let gen = new NetworkGenerator({
        inputShape:[4],
        outputShape:[1],
        layers:[
            {type:'layerNormalization'},
            {type:'dense',activation:'linear',units:'8'},
            {type:'dense',activation:'sigmoid',units:1}
        ],
        optimizer:'adam',
        loss:'meanSquaredError'
    });



    for(let i = 0; i < gen.length;i++){
        let config = gen.getItem(i);
        let modelName = getModelName(config);
        let modelDir = path.join(conf.modelsDir,modelName);
        let outputImage = path.join(conf.outputsDir,modelName+'.jpeg');
        let net = new Network(config);
        console.log(`${i+1}/${gen.length} - carregando modelo ${modelName}...`);
        await net.load(modelDir);
        let data = generateTrainingData(1000);
        await net.train(data,{
            epochs: epochs,
           // stponOnLossGrow:true,
            callbacks:{
                onBatchEnd:async function(epoch,epochs,loss,acc){
                    console.log(`${epoch}/${epochs} loss:${loss}, accuracy:${acc}`);
                    await net.save(modelDir);
                }
            }
        });
        await net.save(modelDir);
        fs.writeFileSync(outputImage,await generateImage(net,{width:256,height:256}));
    }
})();