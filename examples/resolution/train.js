const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs-node-gpu');
const Network = require('../../Networks/Network');
const NetworkGenerator = require('../../Networks/NetworkGenerator');
const epochs = 10;
const config = require('./config');
const sort = require('./sort');

function getModelName(c,source,target){
    return [
        source.join('x'),
        target.join('x')
    ].concat(
        c.layers.map(function(l){
            return [
                l.type,
                l.filters,
                l.activation
            ].filter((f) => f !== undefined).join('_');
        }).filter((f) => f.length > 0)
    ).join('_');
}

async function train(source,target,layers){
    if(!fs.existsSync(config.modelsDir)){
        fs.mkdirSync(config.modelsDir,{recursive:true});
    }

    layers = layers || [
        {type:'conv2d',filters:'1-512',activation:'elu'},
        {type:'conv2d',filters:3,activation:'relu'},
        {type:'upSampling2d',size:[2,2]},
    ];

    let configs = new NetworkGenerator({
        inputShape:[...source].concat(3),
        outputShape:[...target].concat(3),
        layers:layers,
        optimizer:'adam',
        loss:'absoluteDifference'
    });

    for(let i = 0; i < configs.length;i++){
        let c = configs.getItem(i);
        let modelName = getModelName(c,source,target);
        let modelDir = path.join(config.modelsDir,modelName);
        console.log(`${i+1}/${configs.length} - processando modelo ${modelName}...`);
        // if(fs.existsSync(modelDir)){
        //     console.log(`${i+1}/${configs.length} - pulando modelo ${modelName}...`);
        //     await sort(source,target);
        //     continue;
        // }
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
        //    stopOnLossGrow:true,
            callbacks:{
                onBatchEnd:function(epoch,epochs,loss,acc){
                    console.log(`${epoch}/${epochs} loss:${loss}, accuracy:${acc}`);
                }
            }
        });

        await net.save(modelDir);
        await sort(source,target);
    }
}

(async function(){
    for(let i = 0; i < config.train.length;i++){
        let t = config.train[i];
        await train(t.input,t.output,t.layers);
    }
})();