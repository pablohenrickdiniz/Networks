const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs-node');
const stringHash = require('string-hash');
const Network = require('../../Networks/Network');
const NetworkGenerator = require('../../Networks/NetworkGenerator');
const predict = require('./predict');
const epochs = 100;
const config = require('./config');
const top = require('./top');

function getModelName(c,source,target){
    return [
        source.join('x'),
        target.join('x')
    ].concat(
        c.layers.map(function(l){
            return l.filters;
        }).filter((f) => f !== undefined)
    ).join('_');
}

async function train(source,target){
    if(!fs.existsSync(config.modelsDir)){
        fs.mkdirSync(config.modelsDir,{recursive:true});
    }
    let configs = new NetworkGenerator({
        inputShape:[...source].concat(3),
        outputShape:[...target].concat(3),
        layers:[
            {type:'conv2d',filters:'1|2|4|8|16|32|64|128|256|512',activation:'elu'},
            {type:'conv2d',filters:3,activation:'relu'},
            {type:'upSampling2d',size:[2,2]},
        ],
        optimizer:'adam',
        loss:'absoluteDifference'
    });

    for(let i = 0; i < configs.length;i++){
        let c = configs.getItem(i);
        let modelName = getModelName(c,source,target);
        let modelDir = path.join(config.modelsDir,modelName);
        console.log(`${i+1}/${configs.length} - processando modelo ${modelName}...`);
        if(fs.existsSync(modelDir)){
            console.log(`${i+1}/${configs.length} - pulando modelo ${modelName}...`);
            await predict(modelDir,source,target);
            continue;
        }
        let net = new Network(c);    
        await net.load(modelDir);
        let sourceDir = path.join(config.resolutionsDir,source.join('x'));
        let targetDir = path.join(config.resolutionsDir,target.join('x'));

        let data =  fs
            .readdirSync(sourceDir)
            .filter((f) => fs.existsSync(path.join(targetDir,f)))
            .map((f) => path.join(sourceDir,f))
            .map(function(f){
                return [
                    f,
                    path.join(targetDir,path.basename(f))
                ];
            });

        let dataset = tf.data.array(data).map(function(e){
            return {
                xs: tf.node.decodeImage(fs.readFileSync(e[0])),
                ys: tf.node.decodeImage(fs.readFileSync(e[1]))
            };
        });
      
        await net.train(dataset,{
            epochs: epochs,
          //  stopOnLossGrow:true,
            callbacks:{
                onBatchEnd:function(epoch,epochs,loss,acc){
                    console.log(`${epoch}/${epochs} loss:${loss}, accuracy:${acc}`);
                }
            }
        });

        await net.save(modelDir);
        await predict(modelDir,source,target);
      //  await top(110,100);
    }
}

(async function(){
    for(let i = 0; i < config.train.length;i++){
        let t = config.train[i];
        await train(t.input,t.output);
    }
})();