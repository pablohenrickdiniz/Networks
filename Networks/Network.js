const tf = require('@tensorflow/tfjs-node');
function Network(options){
    let self = this;
    initialize(self,options);
}

function incrementLearningRate(learningRate){
    return 1/Math.pow(10,Math.log10(1/learningRate)+1);
}

function reshape(tensor,shape){
    let length = shape.reduce(function(a,b){
        return a*b;
    },1);
    let data = tensor.flatten().arraySync();
    while(data.length < length){
        data.push(0);
    }
    if(data.length > length){
        data = data.slice(0,length);
    }
    return tf.tensor(data,shape);
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

        let testing_size = Math.floor(size*testingSize);
        
        let testing_dataset = dataset.take(testing_size).shuffle(1024).batch(batchSize);
        let training_dataset = dataset.skip(testing_size).shuffle(1024).batch(batchSize);
    
        for(let i = 0; i < epochs;i++){
            let res = await self.model.fitDataset(training_dataset,{
                validationData:testing_dataset,
                verbose:0,
                epochs:1
            });
            let loss = res.history.loss[0];
            let acc = res.history.acc[0];
            if(isNaN(loss)){
                learningRate = incrementLearningRate(learningRate);
                console.log('learning rate changed to '+learningRate);
                model = createModel();
                i--;
                continue;
            }
            if(callback){
                callback(i+1,epochs,loss,acc*100);
            }
        }
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

    let createModel = function(){
        let model = tf.sequential();
       
        for(let i = 0; i < layers;i++){
            let activation = hiddenActivation;
            let units = hiddenUnits;
            if(i === 0){
                units = inputUnits;
            }
            if(i === layers-1){
                activation = outputActivation;
                units = outputs;
            }
            switch(type){
                case 'lstm':
                case 'gru': 
                case 'simpleRNN':
                    model.add(tf.layers[type]({
                        inputShape: i === 0?self.inputShape:null,
                        units:units,
                        returnSequences:true,
                        activation:activation
                    }));
                    break;
                default:
                    model.add(tf.layers.dense({
                        inputShape: i === 0?self.inputShape:null,
                        units:units,
                        activation:activation
                    }));
            }
        }
     
        model.compile({
            loss:tf.losses[loss],
            optimizer:tf.train[optimizer](learningRate),
            metrics:['acc']
        });
        return model;
    };

    Object.defineProperty(self,'model',{
        get:function(){
            if(model === null){
                model = createModel();
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
}

module.exports = Network;