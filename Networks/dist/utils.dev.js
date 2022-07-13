"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var tf = require('@tensorflow/tfjs-node');

function incrementLearningRate(learningRate) {
  return learningRateFrom(learningRateLog(learningRate) + 1);
}

function learningRateLog(learningRate) {
  return Math.log10(1 / learningRate);
}

function learningRateFrom(e) {
  return 1 / Math.pow(10, e);
}

function equals(shapeA, shapeB) {
  if (shapeA.length !== shapeB.length) {
    return false;
  }

  for (var i = 0; i < shapeA.length; i++) {
    if (shapeA[i] !== shapeB[i]) {
      return false;
    }
  }

  return true;
}

function addConv2d(model, inputShape, filters) {
  filters = filters || shapeProduct(inputShape);
  model.add(tf.layers.conv2d({
    inputShape: reshapeToDimen(model, inputShape, 3),
    kernelSize: 1,
    filters: filters
  }));
  return getOuputShape(model);
}

function addMaxPooling2d(model) {
  model.add(tf.layers.maxPooling2d({
    poolSize: 1,
    strides: 1
  }));
  return getOuputShape(model);
}

function calcTargetShape(inputShape, length) {
  var targetShape = _toConsumableArray(inputShape);

  var l = targetShape.length;
  var d = length - l;

  if (d > 0) {
    targetShape.length = length;
    targetShape.fill(1, l, d + 1);
  } else if (d < 0) {
    var acc = 1;

    while (targetShape.length > length) {
      var p = targetShape.pop();

      if (p > 0) {
        acc *= p;
      }
    }

    targetShape[targetShape.length - 1] *= acc;
  }

  return targetShape;
}

function reshapeToDimen(model, inputShape, targetDim) {
  var targetShape = calcTargetShape(inputShape, targetDim);

  if (!equals(inputShape, targetShape)) {
    model.add(tf.layers.reshape({
      inputShape: inputShape,
      targetShape: targetShape
    }));
  }

  return targetShape;
}

function reshapeToShape(model, inputShape, targetShape) {
  if (!equals(inputShape, targetShape)) {
    inputShape = addFlatten(model, inputShape);
    addDense(model, inputShape, 128);
  }

  return getOuputShape(model);
}

function addRecurrent(type, model, inputShape, units, activation) {
  model.add(tf.layers[type]({
    inputShape: reshapeToDimen(model, inputShape, 2),
    units: units,
    activation: activation
  }));
  return getOuputShape(model);
}

function addDense(model, inputShape, units, activation) {
  model.add(tf.layers.dense({
    inputShape: inputShape,
    units: units,
    activation: activation
  }));
  return getOuputShape(model);
}

function addNormalization(model, inputShape) {
  model.add(tf.layers.layerNormalization({
    inputShape: inputShape
  }));
  return getOuputShape(model);
}

function addFlatten(model, inputShape) {
  model.add(tf.layers.flatten({
    inputShape: inputShape
  }));
  return getOuputShape(model);
}

function addDropout(model, inputShape, rate) {
  rate = rate || 0.1;
  model.add(tf.layers.dropout({
    inputShape: inputShape,
    rate: rate
  }));
  return getOuputShape(model);
}

function addElu(model, inputShape) {
  model.add(tf.layers.elu({
    inputShape: inputShape
  }));
  return getOuputShape(model);
}

function addLeakyReLU(model, inputShape) {
  model.add(tf.layers.leakyReLU({
    inputShape: inputShape
  }));
  return getOuputShape(model);
}

function addPrelu(model, inputShape) {
  model.add(tf.layers.prelu({
    inputShape: inputShape
  }));
  return getOuputShape(model);
}

function addReLU(model, inputShape) {
  model.add(tf.layers.reLU({
    inputShape: inputShape
  }));
  return getOuputShape(model);
}

function addSoftmax(model, inputShape) {
  model.add(tf.layers.softmax({
    inputShape: inputShape
  }));
  return getOuputShape(model);
}

function addThresholdedReLU(model, inputShape) {
  model.add(tf.layers.thresholdedReLU({
    inputShape: inputShape
  }));
  return getOuputShape(model);
}

function addUpSampling2d(model, size) {
  model.add(tf.layers.upSampling2d({
    size: size
  }));
  return getOuputShape(model);
}

function getOuputShape(model) {
  return model.output.shape.filter(function (v) {
    return v !== null;
  });
}

function createModel(options) {
  options.layers = options.layers || [];
  options.loss = options.loss || 'meanSquaredError';
  options.optimizer = options.optimizer || 'sgd';
  options.learningRate = options.learningRate || 0.01;
  var model = tf.sequential();
  var inputShape = options.inputShape;
  var outputShape = options.outputShape;

  for (var i = 0; i < options.layers.length; i++) {
    var layer = options.layers[i];
    var type = 'dense';
    var activation = 'linear';
    var units = 1;
    var filters = 1;
    var poolSize = 2;
    var strides = null;
    var rate = 0.1;
    var targetShape = inputShape;
    var size = [2, 2];

    if (layer.constructor === {}.constructor) {
      if (typeof layer.type === 'string') {
        type = layer.type;
      }

      if (typeof layer.activation === 'string') {
        activation = layer.activation;
      }

      if (!isNaN(layer.units)) {
        units = layer.units;
      }

      if (!isNaN(layer.filters)) {
        filters = layer.filters;
      }

      if (!isNaN(layer.poolSize)) {
        poolSize = layer.poolSize;
      }

      if (!isNaN(layer.strides)) {
        strides = layer.strides;
      }

      if (!isNaN(layer.rate)) {
        rate = layer.rate;
      }

      if (layer.targetShape) {
        targetShape = layer.targetShape;
      }
    } else if (typeof layer === 'string') {
      type = layer;
    }

    switch (type) {
      case 'gru':
      case 'lstm':
      case 'simpleRNN':
        inputShape = addRecurrent(type, model, inputShape, units, activation);
        break;

      case 'conv2d':
        inputShape = addConv2d(model, inputShape, filters);
        break;

      case 'maxPooling2d':
        inputShape = addMaxPooling2d(model, poolSize, strides);
        break;

      case 'upSampling2d':
        inputShape = addUpSampling2d(model, size);
        break;

      case 'dense':
        inputShape = addDense(model, inputShape, units, activation);
        break;

      case 'layerNormalization':
        inputShape = addNormalization(model, inputShape);
        break;

      case 'flatten':
        inputShape = addFlatten(model, inputShape);
        break;

      case 'dropout':
        inputShape = addDropout(model, inputShape, rate);
        break;

      case 'elu':
        inputShape = addElu(model, inputShape);
        break;

      case 'leakyReLU':
        inputShape = addLeakyReLU(model, inputShape);
        break;

      case 'prelu':
        inputShape = addPrelu(model, inputShape);
        break;

      case 'reLU':
        inputShape = addReLU(model, inputShape);
        break;

      case 'softmax':
        inputShape = addSoftmax(model, inputShape);
        break;

      case 'thresholdedReLU':
        inputShape = addThresholdedReLU(model, inputShape);
        break;

      case 'reshape':
        inputShape = reshapeToDimen(model, inputShape, targetShape.length);
        break;
    }

    if (i === options.layers.length - 1) {// inputShape = reshapeToShape(model,inputShape,outputShape);
    }
  }

  model.compile({
    loss: tf.losses[options.loss],
    optimizer: tf.train[options.optimizer](options.learningRate),
    metrics: ['acc']
  });
  return model;
}

;

function reshape(tensor, shape) {
  if (!equals(tensor.shape, shape)) {
    var length = shapeProduct(shape);
    var data = tensor.flatten().arraySync();

    while (data.length < length) {
      data.push(0);
    }

    if (data.length > length) {
      data = data.slice(0, length);
    }

    return tf.tensor(data, shape);
  }

  return tensor;
}

function shapeProduct(shape) {
  return shape.reduce(function (a, b) {
    return (a === null || a <= 0 ? 1 : a) * (b === null || b <= 0 ? 1 : b);
  }, 1);
}

function findBestLearningRate(options, trainingDataset, testingDataset) {
  var minE, maxE, lastMatch, e, learningRate, model, loss;
  return regeneratorRuntime.async(function findBestLearningRate$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          minE = 1;
          maxE = 100;
          lastMatch = null;

        case 3:
          if (!(minE !== maxE)) {
            _context.next = 13;
            break;
          }

          e = minE + Math.floor((maxE - minE) / 2);
          learningRate = learningRateFrom(e);
          model = createModel(Object.assign({}, options, {
            learningRate: learningRate
          }));
          _context.next = 9;
          return regeneratorRuntime.awrap(model.fitDataset(trainingDataset, {
            validationData: testingDataset,
            verbose: 0,
            epochs: 5
          }));

        case 9:
          loss = _context.sent.history.loss[0];

          if (isNaN(loss) || loss === Infinity) {
            minE = e + 1;
          } else {
            lastMatch = learningRate;
            maxE = e;
          }

          _context.next = 3;
          break;

        case 13:
          return _context.abrupt("return", lastMatch);

        case 14:
        case "end":
          return _context.stop();
      }
    }
  });
}

module.exports = {
  reshape: reshape,
  incrementLearningRate: incrementLearningRate,
  createModel: createModel,
  shapeProduct: shapeProduct
};