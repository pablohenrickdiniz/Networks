const tf = require('@tensorflow/tfjs-node');

function incrementLearningRate(learningRate){
    return learningRateFrom(learningRateLog(learningRate)+1);
}

function learningRateLog(learningRate){
    return Math.log10(1/learningRate);
}

function learningRateFrom(e){
    return 1/Math.pow(10,e);
}

function addConv2d(model,inputShape){
    let targetShape = [...inputShape];
    while(targetShape.length < 3){
        targetShape.push(1);
    }
    model.add(tf.layers.reshape({
        inputShape: inputShape,
        targetShape: targetShape
    }));
    model.add(tf.layers.conv2d({
        inputShape: targetShape,
        kernelSize:1,
        filters:1
    }));
    model.add(tf.layers.reshape({
        targetShape:inputShape
    }));
    return model.output.shape.filter((v) => v !== null);
}

function addRecurrent(type,model,inputShape,units,activation){
    let targetShape = [...inputShape];
    while(targetShape.length < 2){
        targetShape.push(1);
    }
    model.add(tf.layers.reshape({
        inputShape: inputShape,
        targetShape: targetShape
    }));
    model.add(tf.layers[type]({
        inputShape: targetShape,
        units: units,
        activation: activation
    }));
    /*
    model.add(tf.layers.reshape({
        targetShape:inputShape
    }));
    */
    return model.output.shape.filter((v) => v !== null);
}

function addDense(model,inputShape,units,activation){
    model.add(tf.layers.dense({
        inputShape: inputShape,
        units: units,
        activation: activation
    }));
    return model.output.shape.filter((v) => v !== null);
}

function createModel(options){
    options.layers = options.layers || [];
    options.loss = options.loss || 'meanSquaredError';
    options.optimizer = options.optimizer || 'sgd';
    options.learningRate = options.learningRate || 0.01;
    
    let model = tf.sequential();
    
    let inputShape = options.inputShape;
    let outputShape = options.outputShape;
  
    for(let i = 0; i < options.layers.length;i++){
        let layer = options.layers[i];
        let type = 'dense';
        let activation = 'linear';
        let units = shapeProduct(inputShape)*2;
       
        if(layer.constructor === {}.constructor){
            if(typeof layer.type === 'string'){
                type = layer.type;
            }

            if(typeof layer.activation === 'string'){
                activation = layer.activation;
            }

            if(!isNaN(layer.units)){
                units = layer.units;
            }
        }
        else if(typeof layer === 'string'){
            type = layer;
        }

        if(i === options.layers.length - 1){
            units = shapeProduct(outputShape);
        }
        
        switch(type){
            case 'gru':
            case 'lstm':
            case 'simpleRNN':
                inputShape = addRecurrent(type,model,inputShape,units,activation);
                break;
            case 'conv2d':
                inputShape = addConv2d(model,inputShape);
                break;
            case 'dense':
                inputShape = addDense(model,inputShape,units,activation);
                break;
        }

        if(i === options.layers.length - 1){
            if(shapeProduct(inputShape) > units){
                addDense(model,inputShape,units,'linear');
            }
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
    return shape.reduce(function(a,b){
        return (a === null?1:a)*(b === null?1:b);
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