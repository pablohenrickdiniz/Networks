"use strict";

var fs = require('fs');

var path = require('path');

var Network = require('../../Networks/Network');

var sharp = require('sharp');

var config = require('./config');

var predict_model = require('./predict_model');

module.exports = function _callee(modelDir, source, target, index, examples) {
  var sourceDir, outputDir, net, images, i, inputImage, outputImage, sharpImage, output;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          index = index || '';
          sourceDir = path.join(config.resolutionsDir, source.join('x'));
          outputDir = path.join(config.outputsDir, source.join('x') + '_' + target.join('x'));

          if (!fs.existsSync(sourceDir)) {
            fs.mkdirSync(sourceDir, {
              recursive: true
            });
          }

          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, {
              recursive: true
            });
          }

          net = new Network();
          _context.next = 8;
          return regeneratorRuntime.awrap(net.load(modelDir));

        case 8:
          images = fs.readdirSync(sourceDir).map(function (f) {
            return path.join(sourceDir, f);
          });

          if (examples !== undefined) {
            images = images.slice(0, examples);
          }

          i = 0;

        case 11:
          if (!(i < images.length)) {
            _context.next = 25;
            break;
          }

          inputImage = images[i];
          outputImage = path.join(outputDir, String(index).padStart(6, '0') + '_' + path.basename(modelDir) + path.basename(inputImage));
          _context.next = 16;
          return regeneratorRuntime.awrap(sharp(inputImage));

        case 16:
          sharpImage = _context.sent;
          _context.next = 19;
          return regeneratorRuntime.awrap(predict_model(sharpImage, net));

        case 19:
          output = _context.sent;
          _context.next = 22;
          return regeneratorRuntime.awrap(output.toFile(outputImage));

        case 22:
          i++;
          _context.next = 11;
          break;

        case 25:
        case "end":
          return _context.stop();
      }
    }
  });
};