const tf = require('@tensorflow/tfjs-node');
const {reshape,incrementLearningRate,createModel} = require('./utils');
const fs = require('fs');

function Network(options){
    let self = this;
    initialize(self,options);
}

function initialize(self,options){
    options = options || {};
    let layers = options.layers || ['dense'];
    let testingSize = options.testingSize || 0.5;
    let type = options.type || 'generic';
    let batchSize = options.batchSize || 1;
    let inputShape = options.inputShape || [1];
    let outputShape = options.outputShape || [1];
    let normalize = options.normalize || false;

    let loss = options.loss || 'meanSquaredError';
    let optimizer = options.optimizer || 'sgd';
    let learningRate = options.learningRate || 0.01;
    let model = null;
    
    let train = async function(data,epochs,callback,onTrainEnd){
        let dataset;
        if(data instanceof tf.data.Dataset){
            dataset = data;
        }
        else{
            dataset = tf.data.array(data).map(function(d){
                let input = d.input instanceof tf.Tensor?d.input:tf.tensor(d.input);
                let output = d.output instanceof tf.Tensor?d.output:tf.tensor(d.output);
    
                input = reshape(input,self.inputTensorShape);
                output = reshape(output,self.outputTensorShape);
    
                return {
                    xs:input,
                    ys:output
                };
            });
        }
        
        let size = dataset.size, loss, acc, ds,res,i;
    
        for(i = 0; i < epochs;i++){
            ds = dataset.shuffle(1024);
            res = await self.model.fitDataset(ds.batch(batchSize),{
                validationData:ds.take( Math.ceil(size*testingSize)).batch(batchSize),
                verbose:0,
                epochs:1
            });

            loss = res.history.loss[0];
            acc  = res.history.acc[0]*100;

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

            ds = null;
            res = null;
        }

        if(onTrainEnd){
            onTrainEnd(loss,acc);
        }
        
        return {loss:loss,acc:acc,learningRate:learningRate};
    };

    let predict = function(input){
        input = input instanceof tf.Tensor?input:tf.tensor(input);
        return self
            .model
            .predict(input);
    };

    let save = async function(dir){
        let configPath = dir+'/config.json';
        await self.model.save('file://'+dir);
        fs.writeFileSync(configPath,JSON.stringify(self.options,null,4));
    };

    let load = async function(dir){
        try{
            let configPath = dir+'/config.json';
            model = await tf.loadLayersModel('file://'+dir+'/model.json');
            let options = JSON.parse(fs.readFileSync(configPath,{encoding:'utf-8'}));
            layers = options.layers;
            type = options.type;
            inputShape = options.inputShape;
            outputShape = options.outputShape;
            loss = options.loss;
            optimizer = options.optimizer;
            learningRate = options.learningRate;
    
            model.compile({
                loss: tf.losses[loss],
                optimizer: tf.train[optimizer](learningRate),
                metrics: ['acc']
            });

            return true;
        }
        catch(e){

        }

        return false;
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

    Object.defineProperty(self,'layers',{
        get:function(){
            return layers;
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

    Object.defineProperty(self,'inputTensorShape',{
        get:function(){
            return inputShape;
        }
    });

    Object.defineProperty(self,'outputTensorShape',{
        get:function(){
            return outputShape;
        }
    });
  
    Object.defineProperty(self,'options',{
        get:function(){
            return {
                inputShape: inputShape,
                outputShape: outputShape,
                layers: layers,
                type: type,
                loss: loss,
                optimizer: optimizer,
                learningRate: learningRate,
                normalize: normalize
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