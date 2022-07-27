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
    let type = options.type || 'generic';
    let batchSize = options.batchSize || 1;
    let inputShape = options.inputShape || [1];
    let outputShape = options.outputShape || [1];

    let loss = options.loss || 'meanSquaredError';
    let optimizer = options.optimizer || 'sgd';
    let learningRate = options.learningRate || 0.01;
    let model = null;
    let metrics = options.metrics || null;
    
    let train = async function(data,options){
        options = options || {};
        let epochs = options.epochs || 1;
        let stopOnLossGrow = options.stopOnLossGrow || false;
        let dataset = null;
        let disposeDataset = false;
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
            disposeDataset = true;
        }
        
        let loss, avgLoss = null, oAvgLoss = null, acc;
        let totalLoss = 0;
        let callbacks = options.callbacks?options.callbacks:{};

        for(let i = 0; i < epochs;i++){
            let ds = dataset.batch(batchSize);

            if(callbacks.onEpochBegin){
                await callbacks.onEpochBegin(i+1,epochs,avgLoss,acc);
            }

            res = await self.model.fitDataset(ds,{
                verbose:0,
                epochs:1
            });
            
            tf.dispose(ds);
            loss = res.history.loss[0];
            acc  = res.history.acc[0]*100;

            if(isNaN(loss) || loss === Infinity){
                learningRate = incrementLearningRate(learningRate);
                console.log('learning rate changed to '+learningRate);
                i--;
                model = createModel(self.options);
                continue;
            }
            else if(loss <= 0){
                break;
            }

            totalLoss += loss;
            avgLoss = totalLoss/(i+1);
            
            if(callbacks.onEpochEnd){
                await callbacks.onEpochEnd(i+1,epochs,avgLoss,acc);
            }

            if(stopOnLossGrow && oAvgLoss !== null && avgLoss >= oAvgLoss){
                break;
            }

            oloss = loss;
            oAvgLoss = avgLoss;
        }

        if(disposeDataset){
            tf.dispose(dataset);
        }

        if(callbacks.onTrainEnd){
            await callbacks.onTrainEnd(avgLoss,acc);
        }

        metrics = {
            loss: avgLoss,
            acc: acc
        };
    };

    let predict = function(input){
        if(input instanceof tf.Tensor){
           input = tf.clone(input);
        }
        else{
            input = tf.tensor(input);
        }
        let prediction = self
            .model
            .predict(input);

        tf.dispose(input);
        return prediction;
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
            metrics = options.metrics || null;
    
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
                metrics: metrics
            };
        }
    });

    Object.defineProperty(self,'metrics',{
        get:function(){
            if(metrics === null){
                metrics = {
                    loss: null,
                    acc: null
                };
            }
            return metrics;
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

    Object.defineProperty(self,'toJSON',{
        get:function(){
            return self.options;
        }
    });
}

module.exports = Network;