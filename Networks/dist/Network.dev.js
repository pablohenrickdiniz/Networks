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
  var type = options.type || 'generic';
  var batchSize = options.batchSize || 1;
  var inputShape = options.inputShape || [1];
  var outputShape = options.outputShape || [1];
  var loss = options.loss || 'meanSquaredError';
  var optimizer = options.optimizer || 'sgd';
  var learningRate = options.learningRate || 0.01;
  var model = null;
  var metrics = options.metrics || null;

  var train = function train(data, options) {
    var epochs, stopOnLossGrow, dataset, disposeDataset, loss, avgLoss, oAvgLoss, acc, totalLoss, callbacks, i, ds;
    return regeneratorRuntime.async(function train$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            options = options || {};
            epochs = options.epochs || 1;
            stopOnLossGrow = options.stopOnLossGrow || false;
            dataset = null;
            disposeDataset = false;

            if (data instanceof tf.data.Dataset) {
              dataset = data;
            } else {
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
              disposeDataset = true;
            }

            avgLoss = null, oAvgLoss = null;
            totalLoss = 0;
            callbacks = options.callbacks ? options.callbacks : {};
            i = 0;

          case 10:
            if (!(i < epochs)) {
              _context.next = 43;
              break;
            }

            ds = dataset.batch(batchSize);

            if (!callbacks.onEpochBegin) {
              _context.next = 15;
              break;
            }

            _context.next = 15;
            return regeneratorRuntime.awrap(callbacks.onEpochBegin(i + 1, epochs, avgLoss, acc));

          case 15:
            _context.next = 17;
            return regeneratorRuntime.awrap(self.model.fitDataset(ds, {
              verbose: 0,
              epochs: 1
            }));

          case 17:
            res = _context.sent;
            tf.dispose(ds);
            loss = res.history.loss[0];
            acc = res.history.acc[0] * 100;

            if (!(isNaN(loss) || loss === Infinity)) {
              _context.next = 29;
              break;
            }

            learningRate = incrementLearningRate(learningRate);
            console.log('learning rate changed to ' + learningRate);
            i--;
            model = createModel(self.options);
            return _context.abrupt("continue", 40);

          case 29:
            if (!(loss <= 0)) {
              _context.next = 31;
              break;
            }

            return _context.abrupt("break", 43);

          case 31:
            totalLoss += loss;
            avgLoss = totalLoss / (i + 1);

            if (!callbacks.onEpochEnd) {
              _context.next = 36;
              break;
            }

            _context.next = 36;
            return regeneratorRuntime.awrap(callbacks.onEpochEnd(i + 1, epochs, avgLoss, acc));

          case 36:
            if (!(stopOnLossGrow && oAvgLoss !== null && avgLoss >= oAvgLoss)) {
              _context.next = 38;
              break;
            }

            return _context.abrupt("break", 43);

          case 38:
            oloss = loss;
            oAvgLoss = avgLoss;

          case 40:
            i++;
            _context.next = 10;
            break;

          case 43:
            if (disposeDataset) {
              tf.dispose(dataset);
            }

            if (!callbacks.onTrainEnd) {
              _context.next = 47;
              break;
            }

            _context.next = 47;
            return regeneratorRuntime.awrap(callbacks.onTrainEnd(avgLoss, acc));

          case 47:
            metrics = {
              loss: avgLoss,
              acc: acc
            };

          case 48:
          case "end":
            return _context.stop();
        }
      }
    });
  };

  var predict = function predict(input) {
    if (input instanceof tf.Tensor) {
      input = tf.clone(input);
    } else {
      input = tf.tensor(input);
    }

    var prediction = self.model.predict(input);
    tf.dispose(input);
    return prediction;
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
            metrics = _options.metrics || null;
            model.compile({
              loss: tf.losses[loss],
              optimizer: tf.train[optimizer](learningRate),
              metrics: ['acc']
            });
            return _context3.abrupt("return", true);

          case 18:
            _context3.prev = 18;
            _context3.t0 = _context3["catch"](0);

          case 20:
            return _context3.abrupt("return", false);

          case 21:
          case "end":
            return _context3.stop();
        }
      }
    }, null, null, [[0, 18]]);
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
        metrics: metrics
      };
    }
  });
  Object.defineProperty(self, 'metrics', {
    get: function get() {
      if (metrics === null) {
        metrics = {
          loss: null,
          acc: null
        };
      }

      return metrics;
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
  Object.defineProperty(self, 'toJSON', {
    get: function get() {
      return self.options;
    }
  });
}

module.exports = Network;