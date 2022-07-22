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

function equals(shapeA,shapeB){
    if(shapeA.length !== shapeB.length){
        return false;
    }
    for(let i = 0; i < shapeA.length;i++){
        if(shapeA[i] !== shapeB[i]){
            return false;
        }
    }

    return true;
}

function addConv2d(model,inputShape,filters,kernelSize,poolSize,activation){
    filters = filters || shapeProduct(inputShape);
    kernelSize = kernelSize || 1;
    poolSize = poolSize || 1;
    model.add(tf.layers.conv2d({
        inputShape: reshapeToDimen(model,inputShape,3),
        kernelSize:kernelSize,
        poolSize:poolSize,
        filters:filters,
        activation: activation
    }));
    return getOuputShape(model);
}

function addMaxPooling2d(model){
    model.add(tf.layers.maxPooling2d({
        poolSize: 1,
        strides: 1
    }));
    return getOuputShape(model);
}

function calcTargetShape(inputShape,length){
    let targetShape = [...inputShape];
    let l = targetShape.length;
    let d = length-l;
    if(d > 0){
        targetShape.length = length;
        targetShape.fill(1,l,d+1);
    }
    else if(d < 0){
        let acc = 1;
        while(targetShape.length > length){
            let p = targetShape.pop();
            if(p > 0){
                acc *= p;
            }
        }
        targetShape[targetShape.length-1] *= acc;
    }
    return targetShape;
}

function reshapeToDimen(model,inputShape,targetDim){
    let targetShape = calcTargetShape(inputShape,targetDim);
    if(!equals(inputShape,targetShape)){
        model.add(tf.layers.reshape({
            inputShape: inputShape,
            targetShape: targetShape
        }));
    }
    return targetShape;
}

function reshapeToShape(model,inputShape,targetShape){
    if(!equals(inputShape,targetShape)){
        inputShape = addFlatten(model,inputShape);
        addDense(model,inputShape,128);
    }
    return getOuputShape(model);
}

function addRecurrent(type,model,inputShape,units,activation){
    model.add(tf.layers[type]({
        inputShape: reshapeToDimen(model,inputShape,2),
        units: units,
        activation: activation
    }));
    return getOuputShape(model);
}

function addDense(model,inputShape,units,activation){
    model.add(tf.layers.dense({
        inputShape: inputShape,
        units: units,
        activation: activation
    }));
    return getOuputShape(model);
}

function addNormalization(model,inputShape){
    model.add(tf.layers.layerNormalization({
        inputShape: inputShape
    }));
    return getOuputShape(model);
}

function addFlatten(model,inputShape){
    model.add(tf.layers.flatten({
        inputShape: inputShape
    }));
    return getOuputShape(model);
}

function addDropout(model,inputShape,rate){
    rate = rate || 0.1;
    model.add(tf.layers.dropout({
        inputShape: inputShape,
        rate: rate
    }));
    return getOuputShape(model);
}

function addElu(model,inputShape){
    model.add(tf.layers.elu({
        inputShape: inputShape
    }));
    return getOuputShape(model);
}

function addLeakyReLU(model,inputShape){
    model.add(tf.layers.leakyReLU({
        inputShape: inputShape
    }));
    return getOuputShape(model);
}

function addPrelu(model,inputShape){
    model.add(tf.layers.prelu({
        inputShape: inputShape
    }));
    return getOuputShape(model);
}

function addReLU(model,inputShape){
    model.add(tf.layers.reLU({
        inputShape: inputShape
    }));
    return getOuputShape(model);
}

function addSoftmax(model,inputShape){
    model.add(tf.layers.softmax({
        inputShape: inputShape
    }));
    return getOuputShape(model);
}

function addThresholdedReLU(model,inputShape){
    model.add(tf.layers.thresholdedReLU({
        inputShape: inputShape
    }));
    return getOuputShape(model);
}

function addUpSampling2d(model,size){
    model.add(tf.layers.upSampling2d({
        size: size
    }));
    return getOuputShape(model);
}

function getOuputShape(model){
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
        let units =  1;
        let filters = 1;
        let kernelSize = 1;
        let poolSize = 2;
        let strides = null;
        let rate = 0.1;
        let targetShape = inputShape;
        let size = [2,2];
       
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
            
            if(!isNaN(layer.filters)){
                filters = layer.filters;
            }

            if(!isNaN(layer.poolSize)){
                poolSize = layer.poolSize;
            }

            if(!isNaN(layer.kernelSize)){
                kernelSize = layer.kernelSize;
            }

            if(!isNaN(layer.strides)){
                strides = layer.strides;
            }

            if(!isNaN(layer.rate)){
                rate = layer.rate;
            }

            if(layer.targetShape){
                targetShape = layer.targetShape;
            }

            if(layer.size){
                size = layer.size;
            }
        }
        else if(typeof layer === 'string'){
            type = layer;
        }
        
        switch(type){
            case 'gru':
            case 'lstm':
            case 'simpleRNN':
                inputShape = addRecurrent(type,model,inputShape,units,activation);
                break;
            case 'conv2d':
                inputShape = addConv2d(model,inputShape,filters,kernelSize,poolSize,activation);
                break;
            case 'maxPooling2d':
                inputShape = addMaxPooling2d(model,poolSize,strides);
                break;
            case 'upSampling2d':
                inputShape = addUpSampling2d(model,size)
                break;
            case 'dense':
                inputShape = addDense(model,inputShape,units,activation);
                break;
            case 'layerNormalization':
                inputShape = addNormalization(model,inputShape);
                break;
            case 'flatten':
                inputShape = addFlatten(model,inputShape);
                break;
            case 'dropout':
                inputShape = addDropout(model,inputShape,rate);
                break;
            case 'elu':
                inputShape = addElu(model,inputShape);
                break;
            case 'leakyReLU':
                inputShape = addLeakyReLU(model,inputShape);
                break;
            case 'prelu':
                inputShape = addPrelu(model,inputShape);
                break;
            case 'reLU':
                inputShape = addReLU(model,inputShape);
                break;
            case 'softmax':
                inputShape = addSoftmax(model,inputShape);
                break;
            case 'thresholdedReLU':
                inputShape = addThresholdedReLU(model,inputShape);
                break;
            case 'reshape':
                inputShape = reshapeToDimen(model,inputShape,targetShape.length);
                break;
        }

        if(i === options.layers.length - 1){
           // inputShape = reshapeToShape(model,inputShape,outputShape);
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
    if(!equals(tensor.shape,shape)){
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
    return tensor;
}

function shapeProduct(shape){
    return shape.reduce(function(a,b){
        return (a === null || a <= 0?1:a)*(b === null || b <= 0?1:b);
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