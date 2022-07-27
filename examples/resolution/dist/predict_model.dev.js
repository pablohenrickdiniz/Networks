"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var tf = require('@tensorflow/tfjs-node');

var sharp = require('sharp');

module.exports = function _callee(image, model) {
  var _model$options$inputS, modelHeight, modelWidth, meta, width, height, input, predict;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _model$options$inputS = _slicedToArray(model.options.inputShape, 2), modelHeight = _model$options$inputS[0], modelWidth = _model$options$inputS[1];
          _context.next = 3;
          return regeneratorRuntime.awrap(image.metadata());

        case 3:
          meta = _context.sent;
          width = meta.width;
          height = meta.height; // if(height > width){
          //     let p = width/height;
          //     height = Math.max(height,target[1]);
          //     width = height*p;
          // }
          // else if(height < width){
          //     let p = height/width;
          //     width = Math.max(width,target[0]);
          //     height = width*p;
          // }
          // else{
          //     width = height = Math.max(width,target[0]);
          // }
          // width = parseInt(width);
          // height = parseInt(height);

          _context.t0 = tf.node;
          _context.next = 9;
          return regeneratorRuntime.awrap(image.resize(modelHeight, modelWidth, {
            fit: 'fill'
          }).ensureAlpha().toBuffer());

        case 9:
          _context.t1 = _context.sent;
          input = _context.t0.decodeImage.call(_context.t0, _context.t1, 4).expandDims();
          predict = model.predict(input).squeeze();
          _context.t2 = sharp;
          _context.next = 15;
          return regeneratorRuntime.awrap(tf.node.encodePng(predict));

        case 15:
          _context.t3 = _context.sent;
          _context.t4 = width;
          _context.t5 = height;
          _context.t6 = {
            fit: 'fill'
          };
          return _context.abrupt("return", (0, _context.t2)(_context.t3).resize(_context.t4, _context.t5, _context.t6));

        case 20:
        case "end":
          return _context.stop();
      }
    }
  });
};