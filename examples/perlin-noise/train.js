const Network = require('../../Networks/Network');
const NetworkGenerator =  require('../../Networks/NetworkGenerator');
const path = require('path');
const conf = require('./config');
const generateTrainingData = require('./generate-training-data');
const generateImage = require('./generate-image');
const epochs = 100;
const fs = require('fs');

function getModelName(c){
    return c.layers.map(function(l){
        return [
            l.type,
            l.units,
            l.filters,
            l.activation
        ].filter((f) => f !== undefined).join('_');
    }).filter((f) => f.length > 0).join('_');
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
            {type:'dense',activation:'*',units:'1|2|4|8|16|32|64|128'},
            {type:'dense',activation:'*',units:1}
        ],
        optimizer:'adam',
        loss:'absoluteDifference'
    });

    for(let i = 0; i < gen.length;i++){
        let config = gen.getItem(i);
        let modelName = getModelName(config);
        let modelDir = path.join(conf.modelsDir,modelName);
        let outputImage = path.join(conf.outputsDir,modelName+'.jpeg');
        let net = new Network(config);
        if(fs.existsSync(modelDir)){
            fs.writeFileSync(outputImage,await generateImage(net));
            continue;
        }
        await net.load(modelDir);
        let data = generateTrainingData(100);
        await net.train(data,{
            epochs: epochs,
            callbacks:{
                onBatchEnd:function(epoch,epochs,loss,acc){
                    console.log(`${epoch}/${epochs} loss:${loss}, accuracy:${acc}`);
                }
            }
        });
        await net.save(modelDir);
        fs.writeFileSync(outputImage,await generateImage(net));
    }
})();