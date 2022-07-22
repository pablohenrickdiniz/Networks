const tf = require('@tensorflow/tfjs-node-gpu');
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

    let loss = options.loss || 'meanSquaredError';
    let optimizer = options.optimizer || 'sgd';
    let learningRate = options.learningRate || 0.01;
    let model = null;
    let metrics = options.metrics || null;
    
    let train = async function(data,options){
        options = options || {};
        let epochs = options.epochs || 1;
        let stopOnLossGrow = options.stopOnLossGrow || false;
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
        
        let size = dataset.size, loss, oloss,avgLoss = null, oAvgLoss = null, acc, ds,res;
        let totalLoss = 0;

        for(let i = 0; i < epochs;i++){
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
            else if(loss <= 0){
                break;
            }

            totalLoss += loss;
            avgLoss = totalLoss/(i+1);
            
            if(
                options.callbacks.constructor === {}.constructor &&
                options.callbacks.onBatchEnd
            ){
                options.callbacks.onBatchEnd(i+1,epochs,avgLoss,acc);
            }
            ds = null;
            res = null;

            if(stopOnLossGrow && oAvgLoss !== null && avgLoss >= oAvgLoss){
                break;
            }

            oloss = loss;
            oAvgLoss = avgLoss;
        }

        if(
            options.callbacks.constructor === {}.constructor &&
            options.callbacks.onTrainEnd
        ){
            options.callbacks.onTrainEnd(avgLoss,acc);
        }

        metrics = {
            loss: avgLoss,
            acc: acc
        };
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
}

module.exports = Network;