const fs = require('fs');
const path = require('path');
const highResDir = '/content/drive/MyDrive/ia-projects/resolution/high-resolution';
const lowResDir = '/content/drive/MyDrive/ia-projects/resolution/low-resolution';
const modelsDir = '/content/drive/MyDrive/ia-projects/resolution/models';
const tf = require('@tensorflow/tfjs-node');
const stringHash = require('string-hash');
const Network = require('../../Networks/Network');
const NetworkGenerator = require('../../Networks/NetworkGenerator');
const predict = require('./predict');
const epochs = 500;
const imagesDir = '/content/drive/MyDrive/ia-projects/resolution/images';
const outputsDir = '/content/drive/MyDrive/ia-projects/resolution/outputs';
//const top = require('./top');

async function train(){
    if(!fs.existsSync(highResDir)){
        fs.mkdirSync(highResDir,{recursive:true});
    }

    if(!fs.existsSync(lowResDir)){
        fs.mkdirSync(lowResDir,{recursive:true});
    }

    if(!fs.existsSync(modelsDir)){
        fs.mkdirSync(modelsDir,{recursive:true});
    }
    //config A
    let configs = new NetworkGenerator({
        inputShape:[128,128,3],
        outputShape:[2048,2048,3],
        layers:[
            {type:'conv2d',filters:'1|2|4|8|16|32',activation:'relu',poolSize:['1|2|4|8|16|32','1|2|4|8|16|32']},
            'maxPooling2d',
            'upSampling2d',
            {type:'conv2d',filters:'1|2|4|8|16|32',activation:'relu',poolSize:['1|2|4|8|16|32','1|2|4|8|16|32']},
            'maxPooling2d',
            'upSampling2d',
            {type:'conv2d',filters:'1|2|4|8|16|32',activation:'relu',poolSize:['1|2|4|8|16|32','1|2|4|8|16|32']},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'conv2d',filters:'1|2|4|8|16|32',activation:'relu',poolSize:['1|2|4|8|16|32','1|2|4|8|16|32']},
            'maxPooling2d',
            'upSampling2d',
            {type:'conv2d',filters:3,activation:'relu',poolSize:['1|2|4|8|16|32','1|2|4|8|16|32']},
            'maxPooling2d'
        ],
        optimizer:'rmsprop|adam',
        loss:'meanSquaredError|huberLoss|cosineDistance|absoluteDifference'
    });

    //config B
    configs = new NetworkGenerator({
        inputShape:[128,128,3],
        outputShape:[2048,2048,3],
        layers:[
            {type:'conv2d',filters:'2|4|8|16|32|64',activation:'elu|relu|selu|relu6'},
            {type:'conv2d',filters:3,activation:'elu|relu|selu|relu6'},
            {type:'upSampling2d',size:[16,16]}
        ],
        optimizer:'rmsprop|adam|sgd',
        loss:'meanSquaredError|absoluteDifference'
    });

     //config C
     configs = new NetworkGenerator({
        inputShape:[128,128,3],
        outputShape:[2048,2048,3],
        layers:[
            {type:'conv2d',filters:'64',activation:'elu|relu|selu'},
            {type:'conv2d',filters:3,activation:'elu|relu|selu'},
            {type:'upSampling2d',size:[16,16]}
        ],
        optimizer:'adam|sgd',
        loss:'meanSquaredError|absoluteDifference'
    });

    for(let i = 0; i < configs.length;i++){
        let random = Math.floor(Math.random()*configs.length);
        let config = configs.getItem(random);
      
        let id = String(stringHash(JSON.stringify(config)));
        let modelDir = path.join(modelsDir,id);
        console.log(`${i+1}/${configs.length} - processando modelo ${id}...`);
        console.log(JSON.stringify(config));
        if(fs.existsSync(modelDir)){
            console.log(`${i+1}/${configs.length} - pulando modelo ${id}...`);
            continue;
        }
     
        let net = new Network(config);        
        await net.load(modelDir);
        let data =  fs
            .readdirSync(lowResDir)
            .filter((f) => fs.existsSync(path.join(highResDir,f)))
            .map((f) => path.join(lowResDir,f))
            .map(function(f){
                return [
                    f,
                    path.join(highResDir,path.basename(f))
                ];
            })
            .slice(0,1);

        let dataset = tf.data.array(data).map(function(e){
            return {
                xs: tf.node.decodeImage(fs.readFileSync(e[0])),
                ys: tf.node.decodeImage(fs.readFileSync(e[1]))
            };
        });
    
        await net.train(dataset,{
            epochs: epochs,
            stopOnLossGrow:true,
            callbacks:{
                onBatchEnd:function(epoch,epochs,loss,acc){
                    console.log(`${epoch}/${epochs} loss:${loss}, accuracy:${acc}`);
                }
            }
        });
        
        await net.save(modelDir);
        await predict(modelDir,imagesDir,outputsDir);
        //await top(1000,100);
    }
};

(async function(){
    let finished = false;
    do{
        try{
            await train();
            finished = true;
        }
        catch(e){
            console.log(e);
        }
    }
    while(!finished);
})();