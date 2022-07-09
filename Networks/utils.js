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
    options.layers = options.layers || [];
    options.loss = options.loss || 'meanSquaredError';
    options.optimizer = options.optimizer || 'sgd';
    options.learningRate = options.learningRate || 0.01;
    options.normalize = options.normalize || false;

    let model = tf.sequential();


    let inputShape = options.inputShape;
    let first = true;

    if(options.normalize){
        model.add(tf.layers.layerNormalization({
            inputShape: inputShape
        }));
        first = false;
    }

    for(let i = 0; i < options.layers.length;i++){
        let type = options.layers[i];
        let activation = options.hiddenActivation;
        let units = shapeProduct(options.inputShape)*2;

        if(i === options.layers.length -1){
            units = shapeProduct(options.outputShape);
        }

        switch(type){
            case 'gru':
            case 'lstm':
            case 'simpleRNN':
                let targetShape = [...inputShape];
                targetShape.push(1);
                model.add(tf.layers.reshape({
                    inputShape: first?inputShape:null,
                    targetShape: targetShape
                }));
                first = false;
                break;
        }

        let opt = {
            inputShape: first?inputShape:null,
            units:units,
            activation:activation
        };
        
        model.add(tf.layers[type](opt));
        first = false;
    }
    
 
    model.compile({
        loss:tf.losses[options.loss],
        optimizer:tf.train[options.optimizer](options.learningRate),
        metrics:['acc']
    });
    return model;
};

function reshape(tensor,shape){
    let length = shapeProduct(shape);
    let data = tensor.flatten().arraySync();
    while(data.length < length){
        data.push(0);
    }
    if(data.length > length){
        data = data.slice(0,length);
    }
    return tf.tensor(data,shape);
}

function shapeProduct(shape){
    return shape.reduce(function(p,c){
        return p*c;
    },1);
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
    createModel: createModel,
    shapeProduct: shapeProduct
};