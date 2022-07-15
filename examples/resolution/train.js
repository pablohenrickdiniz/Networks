const fs = require('fs');
const path = require('path');
const highResDir = '/content/drive/MyDrive/ia-projects/resolution/high-resolution';
const lowResDir = '/content/drive/MyDrive/ia-projects/resolution/low-resolution';
const modelsDir = '/content/drive/MyDrive/ia-projects/resolution/models';
const tf = require('@tensorflow/tfjs-node-gpu');
const stringHash = require('string-hash');
const Network = require('../../Networks/Network');
const epochs = 100;
let config,modelDir,net,id,data,dataset;

let configs = [
    /** Config A (tested)*/
    {
        inputShape:[128,128,3],
        outputShape:[2048,2048,3],
        layers:[
            {type:'conv2d',filters:8},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'conv2d',filters:8},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'conv2d',filters:8},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'conv2d',filters:3},
            {type:'maxPooling2d'},
            {type:'upSampling2d'}
        ],
        batchSize:2,
        optimizer:'adam'
    },
    {
        inputShape:[128,128,3],
        outputShape:[2048,2048,3],
        layers:[
            {type:'conv2d',filters:3},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'conv2d',filters:6},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'conv2d',filters:12},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'conv2d',filters:3},
            {type:'maxPooling2d'},
            {type:'upSampling2d'}
        ],
        batchSize:2,
        optimizer:'adam'
    }, 
    {
        inputShape:[128,128,3],
        outputShape:[2048,2048,3],
        layers:[
            {type:'conv2d',filters:32},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'conv2d',filters:32},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'conv2d',filters:32},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'conv2d',filters:3},
            {type:'maxPooling2d'},
            {type:'upSampling2d'}
        ],
        batchSize:2,
        optimizer:'adam'
    },
    {
        inputShape:[128,128,3],
        outputShape:[2048,2048,3],
        layers:[
            {type:'conv2d',filters:8},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'dense',activation:'relu',units:8},
            {type:'conv2d',filters:16},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'dense',activation:'relu',units:16},
            {type:'conv2d',filters:32},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'dense',activation:'relu',units:32},
            {type:'conv2d',filters:3},
            {type:'maxPooling2d'},
            {type:'upSampling2d'}
        ],
        batchSize:2,
        optimizer:'adam'
    },
    {
        inputShape:[128,128,3],
        outputShape:[2048,2048,3],
        layers:[
            {type:'conv2d',filters:8},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'dense',activation:'relu',units:8},
            {type:'conv2d',filters:16},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'dense',activation:'relu',units:16},
            {type:'conv2d',filters:8},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'dense',activation:'relu',units:8},
            {type:'conv2d',filters:3},
            {type:'maxPooling2d'},
            {type:'upSampling2d'}
        ],
        batchSize:2,
        optimizer:'adam'
    },
    {
        inputShape:[128,128,3],
        outputShape:[2048,2048,3],
        layers:[
            {type:'conv2d',filters:3},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'conv2d',filters:6},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'conv2d',filters:12},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            {type:'conv2d',filters:3},
            {type:'maxPooling2d'},
            {type:'upSampling2d'}
        ],
        batchSize:2,
        optimizer:'adam'
    },
    {
        inputShape:[128,128,3],
        outputShape:[2048,2048,3],
        layers:[
            {type:'conv2d',filters:32},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            'dense',
            {type:'conv2d',filters:32},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            'dense',
            {type:'conv2d',filters:32},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            'dense',
            {type:'conv2d',filters:3},
            {type:'maxPooling2d'},
            {type:'upSampling2d'}
        ],
        batchSize:2,
        optimizer:'adam'
    },
    {
        inputShape:[128,128,3],
        outputShape:[2048,2048,3],
        layers:[
            {type:'conv2d',filters:32},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            'dense',
            {type:'conv2d',filters:16},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            'dense',
            {type:'conv2d',filters:8},
            {type:'maxPooling2d'},
            {type:'upSampling2d'},
            'dense',
            {type:'conv2d',filters:3},
            {type:'maxPooling2d'},
            {type:'upSampling2d'}
        ],
        batchSize:2,
        optimizer:'adam'
    }
];

(async function(){
    if(!fs.existsSync(highResDir)){
        fs.mkdirSync(highResDir,{recursive:true});
    }

    if(!fs.existsSync(lowResDir)){
        fs.mkdirSync(lowResDir,{recursive:true});
    }

    if(!fs.existsSync(modelsDir)){
        fs.mkdirSync(modelsDir,{recursive:true});
    }


    for(let i = 0; i < configs.length;i++){
        config = configs[i];
        id = String(stringHash(JSON.stringify(config)));
        modelDir = path.join(modelsDir,id);
        if(fs.existsSync(modelDir)){
            continue;
        }
        net = new Network(config);        
        await net.load(modelDir);
        data =  fs
            .readdirSync(lowResDir)
            .filter((f) => fs.existsSync(path.join(highResDir,f)))
            .map((f) => path.join(lowResDir,f))
            .map(function(f){
                return [
                    f,
                    path.join(highResDir,path.basename(f))
                ];
            })
            .slice(0,8);

        dataset = tf.data.array(data).map(function(e){
            return {
                xs: tf.node.decodeImage(fs.readFileSync(e[0])),
                ys: tf.node.decodeImage(fs.readFileSync(e[1]))
            };
        });
    
        await net.train(dataset,epochs,async function(epoch,epochs,loss,acc){
            console.log(`${epoch}/${epochs} loss:${loss}, accuracy:${acc}`);
        });
        await net.save(modelDir);

        /** Limpar variáveis */
        dataset = null;
        data = null;
        net = null;
        id = null;
        config = null;
        modelDir = null;
    }
})();