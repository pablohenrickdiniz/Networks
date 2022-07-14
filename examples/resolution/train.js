const fs = require('fs');
const path = require('path');
const highResDir = '/content/drive/MyDrive/ia-projects/resolution/high-resolution';
const lowResDir = '/content/drive/MyDrive/ia-projects/resolution/low-resolution';
const modelsDir = '/content/drive/MyDrive/ia-projects/resolution/models';
const tf = require('@tensorflow/tfjs-node-gpu');
const stringHash = require('string-hash');
const Network = require('../../Networks/Network');

(async function(){
    while(true){
        if(!fs.existsSync(highResDir)){
            fs.mkdirSync(highResDir,{recursive:true});
        }
    
        if(!fs.existsSync(lowResDir)){
            fs.mkdirSync(lowResDir,{recursive:true});
        }

        /** Config A (tested)*/
        let config = {
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
        };

         /** Config B */
         let configB = {
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
        };

         /** Config C */
         let configC = {
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
        };

         /** Config D */
         let configD = {
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
        };

          /** Config E*/
          let configE = {
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
        };

         /** Config F*/
         let configF = {
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
        };

         /** Config G */
         let configG = {
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
        };

          /** Config H */
          let configH = {
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
        };

        let id = stringHash(JSON.stringify(config));
        let modelDir = path.join(modelsDir,id);
    
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
            .slice(0,8);


        let dataset = tf.data.array(data).map(function(e){
            return {
                xs: tf.node.decodeImage(fs.readFileSync(e[0])),
                ys: tf.node.decodeImage(fs.readFileSync(e[1]))
            };
        });
    
        await net.train(dataset,100,async function(epoch,epochs,loss,acc){
            console.log(`${epoch}/${epochs} loss:${loss}, accuracy:${acc}`);
        });
        await net.save(modelDir);
    }
})();