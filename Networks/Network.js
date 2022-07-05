const tf = require('@tensorflow/tfjs-node-gpu');
const {reshape,incrementLearningRate,createModel} = require('./utils');
const fs = require('fs');

function Network(options){
    let self = this;
    initialize(self,options);
}

function initialize(self,options){
    options = options || {};
    let inputs = options.inputs || 1;
    let outputs = options.outputs || 1;
    let layers = options.layers || 1;
    let hiddenUnits = options.hiddenUnits || inputs;
    let inputUnits = options.inputUnits || hiddenUnits;
    let hiddenActivation = options.hiddenActivation || 'linear';
    let outputActivation = options.outputActivation || 'linear';
    let testingSize = options.testingSize || 0.5;
    let type = options.type || 'generic';
    let batchSize = options.batchSize || 64;

    let loss = options.loss || 'meanSquaredError';
    let optimizer = options.optimizer || 'sgd';
    let learningRate = options.learningRate || 0.01;
    let model = null;
    
    let train = async function(data,epochs,callback){
        let dataset = tf.data.array(data).map(function(d){
            let input = reshape(tf.tensor(d.input),self.inputShape);
            let output = reshape(tf.tensor(d.output),self.outputShape);
            return {
                xs:input,
                ys:output
            };
        });

        let size = dataset.size;
        dataset = dataset.shuffle(1024);
    
        let testing_size = Math.floor(size*testingSize);
        
        let testing_dataset = dataset.take(testing_size).batch(batchSize);
        let training_dataset = dataset.skip(testing_size).batch(batchSize);
        let loss;
        let acc;

        for(let i = 0; i < epochs;i++){
            let res = await self.model.fitDataset(training_dataset,{
                validationData:testing_dataset,
                verbose:0,
                epochs:1
            });
            let loss = res.history.loss[0];
            let acc = res.history.acc[0]*100;
            if(isNaN(loss) || loss === Infinity){
                learningRate = incrementLearningRate(learningRate);
                console.log('learning rate changed to '+learningRate);
                i--;
                model = createModel(self.options);
                continue;
            }
            else if(loss === 0){
                break;
            }
           
            if(callback){
                callback(i+1,epochs,loss,acc);
            }
        }
        
        return {loss:loss,acc:acc,learningRate:learningRate};
    };

    let predict = function(input){
        return self
            .model
            .predict(
                reshape(
                    tf.tensor(input),
                    self.tensorInputShape
                )
            )
            .flatten()
            .arraySync();
    };

    let save = async function(dir){
        let configPath = dir+'/config.json';
        await self.model.save('file://'+dir);
        fs.writeFileSync(configPath,JSON.stringify(self.options,null,4));
    };

    let load = async function(dir){
        let configPath = dir+'/config.json';
        model = await tf.loadLayersModel('file://'+dir+'/model.json');
        let options = JSON.parse(fs.readFileSync(configPath,{encoding:'utf-8'}));
        inputs = options.inputs;
        outputs = options.outputs;
        layers = options.layers;
        hiddenActivation = options.hiddenActivation;
        hiddenUnits = options.hiddenUnits;
        inputUnits = options.inputUnits;
        outputActivation = options.outputActivation;
        type = options.type;
        inputShape = options.inputShape;
        loss = options.loss;
        optimizer = options.optimizer;
        learningRate = options.learningRate;

        model.compile({
            loss:tf.losses[loss],
            optimizer:tf.train[optimizer](learningRate),
            metrics:['acc']
        });
    };

    Object.defineProperty(self,'model',{
        get:function(){
            if(model === null){
                model = createModel(self.options);
            }
            return model;
        }
    });

    let summary = function(){
        self.model.summary();
    };

    Object.defineProperty(self,'summary',{
        get:function(){
           return summary;
        }
    });

    Object.defineProperty(self,'inputs',{
        get:function(){
            return inputs;
        }
    });

    Object.defineProperty(self,'outputs',{
        get:function(){
            return outputs;
        }
    });

    Object.defineProperty(self,'layers',{
        get:function(){
            return layers;
        }
    });

    Object.defineProperty(self,'varsLength',{
        get:function(){
            return Math.max(inputs,outputs);
        }
    });

    Object.defineProperty(self,'train',{
        get:function(){
            return train;
        }
    });

    Object.defineProperty(self,'predict',{
        get:function(){
            return predict;
        }
    });

    Object.defineProperty(self,'type',{
        get:function(){
            return type;
        }
    });


    Object.defineProperty(self,'inputShape',{
        get:function(){
            switch(type){
                case 'lstm':
                case 'gru':
                case 'simpleRNN':   
                    return [inputs,1];
                default:
                    return [inputs]; 
            }
        }
    });

    Object.defineProperty(self,'outputShape',{
        get:function(){
            switch(type){
                case 'lstm':
                case 'gru':
                case 'simpleRNN':
                    return [outputs,1];
                default:
                    return [outputs]; 
            }
        }
    });

    Object.defineProperty(self,'tensorInputShape',{
        get:function(){
            switch(type){
                case 'lstm':
                case 'gru':
                case 'simpleRNN':        
                    return [1,self.varsLength,1];
                default:
                    return [1,inputs]; 
            }
        }
    });

    Object.defineProperty(self,'tensorOutputShape',{
        get:function(){
            switch(type){
                case 'lstm':
                case 'gru':
                case 'simpleRNN':       
                    return [1,self.varsLength,1];
                default:
                    return [1,outputs]; 
            }
        }
    });

    Object.defineProperty(self,'options',{
        get:function(){
            return {
                inputs: inputs,
                outputs: outputs,
                layers: layers,
                hiddenActivation: hiddenActivation,
                hiddenUnits: hiddenUnits,
                inputUnits: inputUnits,
                outputActivation: outputActivation,
                type: type,
                inputShape: self.inputShape,
                loss: loss,
                optimizer: optimizer,
                learningRate: learningRate
            };
        }
    });

    Object.defineProperty(self,'save',{
        get:function(){
            return save;
        } 
    });

    Object.defineProperty(self,'load',{
        get:function(){
            return load;
        } 
    });
}

module.exports = Network;