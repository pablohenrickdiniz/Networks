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

function addConv2d(model,inputShape,filters){
    filters = filters || shapeProduct(inputShape);
    model.add(tf.layers.conv2d({
        inputShape: addReshape(model,inputShape,3),
        kernelSize:1,
        filters:filters
    }));
    return getOuputShape(model);
}

function addMaxPooling2d(model/*,poolSize,strides*/){
    /*
    poolSize = poolSize || 2;
    strides = strides || poolSize;
    */
    model.add(tf.layers.maxPooling2d({
        poolSize: /*poolSize*/1,
        strides: /*strides*/1
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

function addReshape(model,inputShape,targetDim){
    let targetShape = calcTargetShape(inputShape,targetDim);
    if(targetShape.length !== inputShape.length){
        model.add(tf.layers.reshape({
            inputShape: inputShape,
            targetShape: targetShape
        }));
    }
    return targetShape;
}

function addRecurrent(type,model,inputShape,units,activation){
    model.add(tf.layers[type]({
        inputShape: addReshape(model,inputShape,2),
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
        let units = shapeProduct(inputShape)*2;
        let filters = units;
        let poolSize = 2;
        let strides = null;
       
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

            if(!isNaN(layer.strides)){
                strides = layer.strides;
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
                inputShape = addConv2d(model,inputShape,filters);
                break;
            case 'maxPooling2d':
                inputShape = addMaxPooling2d(model,poolSize,strides);
                break;
            case 'dense':
                inputShape = addDense(model,inputShape,units,activation);
                break;
            case 'layerNormalization':
                inputShape = addNormalization(model,inputShape);
                break;
        }

        if(i === options.layers.length - 1){
            if(inputShape.length !== outputShape.length || shapeProduct(inputShape) !== shapeProduct(outputShape)){
                addDense(
                    model,
                    addReshape(model,inputShape,outputShape.length),
                    shapeProduct(outputShape),'linear'
                );
            }
            /*
            if(shapeProduct(inputShape) > units){
                addDense(model,inputShape,units,'linear');
            }
            */
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