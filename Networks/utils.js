const tf = require('@tensorflow/tfjs-node-gpu');

function incrementLearningRate(learningRate){
    return learningRateFrom(learningRateLog(learningRate)+1);
}

function learningRateLog(learningRate){
    return Math.log10(1/learningRate);
}

function learningRateFrom(e){
    return 1/Math.pow(10,e);
}

function createModel(options){
    options.inputs = options.inputs || 1;
    options.outputs = options.outputs || 1;
    options.layers = options.layers || 1;
    options.hiddenActivation = options.hiddenActivation || 'linear';
    options.hiddenUnits = options.hiddenUnits || options.inputs;
    options.inputUnits = options.inputUnits || options.hiddenUnits;
    options.outputActivation = options.outputActivation || 'linear';
    options.type = options.type || 'generic';
    options.inputShape = options.inputShape || [options.inputs];
    options.loss = options.loss || 'meanSquaredError';
    options.optimizer = options.optimizer || 'sgd';
    options.learningRate = options.learningRate || 0.01;

    let model = tf.sequential();

    model.add(tf.layers.layerNormalization({
        inputShape:options.inputShape
    }));
   
    for(let i = 0; i < options.layers;i++){
        let activation = options.hiddenActivation;
        let units =  options.hiddenUnits;
        if(i === 0){
            units =  options.inputUnits;
        }
        if(i === options.layers-1){
            activation =  options.outputActivation;
            units =  options.outputs;
        }
        switch(options.type){
            case 'lstm':
            case 'gru': 
            case 'simpleRNN':
                model.add(tf.layers[options.type]({
                    inputShape: i === 0?options.inputShape:null,
                    units:units,
                    returnSequences:true,
                    activation:activation
                }));
                break;
            default:
                model.add(tf.layers.dense({
                    inputShape: i === 0?options.inputShape:null,
                    units:units,
                    activation:activation
                }));
        }
    }
 
    model.compile({
        loss:tf.losses[options.loss],
        optimizer:tf.train[options.optimizer](options.learningRate),
        metrics:['acc']
    });
    return model;
};

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

async function findBestLearningRate(options,trainingDataset,testingDataset){
    let minE = 1;
    let maxE = 100;
    let lastMatch = null;

    while(minE !== maxE){
        let e = minE + Math.floor((maxE-minE)/2);
        let learningRate = learningRateFrom(e);
        let model = createModel(Object.assign({},options,{learningRate:learningRate}));
        let loss = (await model.fitDataset(trainingDataset,{
            validationData:testingDataset,
            verbose:0,
            epochs:5
        })).history.loss[0];
        if(isNaN(loss) || loss === Infinity){
           minE = e+1;
        }
        else{
            lastMatch = learningRate;
            maxE = e;
        }
    }

    return lastMatch;
}

module.exports = {
    reshape: reshape,
    incrementLearningRate: incrementLearningRate,
    createModel: createModel
};