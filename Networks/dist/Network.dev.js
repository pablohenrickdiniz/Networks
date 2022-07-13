"use strict";

var tf = require('@tensorflow/tfjs-node');

var _require = require('./utils'),
    reshape = _require.reshape,
    incrementLearningRate = _require.incrementLearningRate,
    createModel = _require.createModel;

var fs = require('fs');

function Network(options) {
  var self = this;
  initialize(self, options);
}

function initialize(self, options) {
  options = options || {};
  var layers = options.layers || ['dense'];
  var testingSize = options.testingSize || 0.5;
  var type = options.type || 'generic';
  var batchSize = options.batchSize || 64;
  var inputShape = options.inputShape || [1];
  var outputShape = options.outputShape || [1];
  var normalize = options.normalize || false;
  var loss = options.loss || 'meanSquaredError';
  var optimizer = options.optimizer || 'sgd';
  var learningRate = options.learningRate || 0.01;
  var model = null;

  var train = function train(data, epochs, callback, onTrainEnd) {
    var dataset, size, testing_size, testing_dataset, training_dataset, loss, acc, i, res, _loss, _acc;

    return regeneratorRuntime.async(function train$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            dataset = tf.data.array(data).map(function (d) {
              var input = d.input instanceof tf.Tensor ? d.input : tf.tensor(d.input);
              var output = d.output instanceof tf.Tensor ? d.output : tf.tensor(d.output);
              input = reshape(input, self.inputTensorShape);
              output = reshape(output, self.outputTensorShape);
              return {
                xs: input,
                ys: output
              };
            });
            size = dataset.size;
            dataset = dataset.shuffle(1024);
            testing_size = Math.floor(size * testingSize);
            testing_dataset = dataset.take(testing_size).batch(batchSize);
            training_dataset = dataset.batch(batchSize);
            i = 0;

          case 7:
            if (!(i < epochs)) {
              _context.next = 27;
              break;
            }

            _context.next = 10;
            return regeneratorRuntime.awrap(self.model.fitDataset(training_dataset, {
              validationData: testing_dataset,
              verbose: 0,
              epochs: 1
            }));

          case 10:
            res = _context.sent;
            _loss = res.history.loss[0];
            _acc = res.history.acc[0] * 100;

            if (!(isNaN(_loss) || _loss === Infinity)) {
              _context.next = 21;
              break;
            }

            learningRate = incrementLearningRate(learningRate);
            console.log('learning rate changed to ' + learningRate);
            i--;
            model = createModel(self.options);
            return _context.abrupt("continue", 24);

          case 21:
            if (!(_loss === 0)) {
              _context.next = 23;
              break;
            }

            return _context.abrupt("break", 27);

          case 23:
            if (callback) {
              callback(i + 1, epochs, _loss, _acc);
            }

          case 24:
            i++;
            _context.next = 7;
            break;

          case 27:
            if (onTrainEnd) {
              onTrainEnd(loss, acc);
            }

            return _context.abrupt("return", {
              loss: loss,
              acc: acc,
              learningRate: learningRate
            });

          case 29:
          case "end":
            return _context.stop();
        }
      }
    });
  };

  var predict = function predict(input) {
    input = input instanceof tf.Tensor ? input : tf.tensor(input);
    return self.model.predict(input);
  };

  var save = function save(dir) {
    var configPath;
    return regeneratorRuntime.async(function save$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            configPath = dir + '/config.json';
            _context2.next = 3;
            return regeneratorRuntime.awrap(self.model.save('file://' + dir));

          case 3:
            fs.writeFileSync(configPath, JSON.stringify(self.options, null, 4));

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    });
  };

  var load = function load(dir) {
    var configPath, _options;

    return regeneratorRuntime.async(function load$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            configPath = dir + '/config.json';
            _context3.next = 4;
            return regeneratorRuntime.awrap(tf.loadLayersModel('file://' + dir + '/model.json'));

          case 4:
            model = _context3.sent;
            _options = JSON.parse(fs.readFileSync(configPath, {
              encoding: 'utf-8'
            }));
            layers = _options.layers;
            type = _options.type;
            inputShape = _options.inputShape;
            outputShape = _options.outputShape;
            loss = _options.loss;
            optimizer = _options.optimizer;
            learningRate = _options.learningRate;
            model.compile({
              loss: tf.losses[loss],
              optimizer: tf.train[optimizer](learningRate),
              metrics: ['acc']
            });
            return _context3.abrupt("return", true);

          case 17:
            _context3.prev = 17;
            _context3.t0 = _context3["catch"](0);

          case 19:
            return _context3.abrupt("return", false);

          case 20:
          case "end":
            return _context3.stop();
        }
      }
    }, null, null, [[0, 17]]);
  };

  Object.defineProperty(self, 'model', {
    get: function get() {
      if (model === null) {
        model = createModel(self.options);
      }

      return model;
    }
  });

  var summary = function summary() {
    self.model.summary();
  };

  Object.defineProperty(self, 'summary', {
    get: function get() {
      return summary;
    }
  });
  Object.defineProperty(self, 'layers', {
    get: function get() {
      return layers;
    }
  });
  Object.defineProperty(self, 'train', {
    get: function get() {
      return train;
    }
  });
  Object.defineProperty(self, 'predict', {
    get: function get() {
      return predict;
    }
  });
  Object.defineProperty(self, 'type', {
    get: function get() {
      return type;
    }
  });
  Object.defineProperty(self, 'inputTensorShape', {
    get: function get() {
      return inputShape;
    }
  });
  Object.defineProperty(self, 'outputTensorShape', {
    get: function get() {
      return outputShape;
    }
  });
  Object.defineProperty(self, 'options', {
    get: function get() {
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
  Object.defineProperty(self, 'save', {
    get: function get() {
      return save;
    }
  });
  Object.defineProperty(self, 'load', {
    get: function get() {
      return load;
    }
  });
}

module.exports = Network;