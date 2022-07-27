"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var config = require('./config');

var fs = require('fs');

var path = require('path');

var Network = require('../../Networks/Network');

var sharp = require('sharp');

var predict_model = require('./predict_model');

function extract(img, left, top, width, height) {
  var buffer;
  return regeneratorRuntime.async(function extract$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(img.extract({
            left: left,
            top: top,
            width: width,
            height: height
          }).toBuffer());

        case 2:
          buffer = _context.sent;
          return _context.abrupt("return", sharp(buffer));

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
}

function enchance(img, model) {
  var inputShape, meta, _inputShape, modelHeight, modelWidth, imageWidth, imageHeight, hw, hh, topLeft, topRight, bottomRight, bottomLeft;

  return regeneratorRuntime.async(function enchance$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          inputShape = model.options.inputShape;
          _context2.next = 3;
          return regeneratorRuntime.awrap(img.metadata());

        case 3:
          meta = _context2.sent;
          _inputShape = _slicedToArray(inputShape, 2), modelHeight = _inputShape[0], modelWidth = _inputShape[1];
          imageWidth = meta.width, imageHeight = meta.height;

          if (!(imageWidth > modelWidth || imageHeight > modelHeight)) {
            _context2.next = 50;
            break;
          }

          hw = Math.floor(imageWidth / 2);
          hh = Math.floor(imageHeight / 2);
          _context2.t0 = regeneratorRuntime;
          _context2.t1 = enchance;
          _context2.next = 13;
          return regeneratorRuntime.awrap(extract(img, 0, 0, hw, hh));

        case 13:
          _context2.t2 = _context2.sent;
          _context2.t3 = model;
          _context2.t4 = (0, _context2.t1)(_context2.t2, _context2.t3);
          _context2.next = 18;
          return _context2.t0.awrap.call(_context2.t0, _context2.t4);

        case 18:
          topLeft = _context2.sent;
          _context2.t5 = regeneratorRuntime;
          _context2.t6 = enchance;
          _context2.next = 23;
          return regeneratorRuntime.awrap(extract(img, hw, 0, hw, hh));

        case 23:
          _context2.t7 = _context2.sent;
          _context2.t8 = model;
          _context2.t9 = (0, _context2.t6)(_context2.t7, _context2.t8);
          _context2.next = 28;
          return _context2.t5.awrap.call(_context2.t5, _context2.t9);

        case 28:
          topRight = _context2.sent;
          _context2.t10 = regeneratorRuntime;
          _context2.t11 = enchance;
          _context2.next = 33;
          return regeneratorRuntime.awrap(extract(img, hw, hh, hw, hh));

        case 33:
          _context2.t12 = _context2.sent;
          _context2.t13 = model;
          _context2.t14 = (0, _context2.t11)(_context2.t12, _context2.t13);
          _context2.next = 38;
          return _context2.t10.awrap.call(_context2.t10, _context2.t14);

        case 38:
          bottomRight = _context2.sent;
          _context2.t15 = regeneratorRuntime;
          _context2.t16 = enchance;
          _context2.next = 43;
          return regeneratorRuntime.awrap(extract(img, 0, hh, hw, hh));

        case 43:
          _context2.t17 = _context2.sent;
          _context2.t18 = model;
          _context2.t19 = (0, _context2.t16)(_context2.t17, _context2.t18);
          _context2.next = 48;
          return _context2.t15.awrap.call(_context2.t15, _context2.t19);

        case 48:
          bottomLeft = _context2.sent;
          img = sharp().composite([{
            input: topLeft,
            top: 0,
            left: 0
          }, {
            input: topRight,
            top: 0,
            left: hw
          }, {
            input: bottomRight,
            top: hh,
            left: hw
          }, {
            input: bottomLeft,
            top: hh,
            left: 0
          }]).png().ensureAlpha();

        case 50:
          _context2.next = 52;
          return regeneratorRuntime.awrap(predict_model(img, model));

        case 52:
          return _context2.abrupt("return", _context2.sent);

        case 53:
        case "end":
          return _context2.stop();
      }
    }
  });
}

(function _callee() {
  var dirs, models, i, model, images, _i2, img, j, _model, output;

  return regeneratorRuntime.async(function _callee$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          if (!fs.existsSync(config.enchanceDir)) {
            fs.mkdirSync(config.enchanceDir, {
              recursive: true
            });
          }

          dirs = fs.readdirSync(config.modelsDir).map(function (d) {
            return path.join(config.modelsDir, d);
          });
          models = [];
          i = 0;

        case 4:
          if (!(i < dirs.length)) {
            _context3.next = 12;
            break;
          }

          model = new Network();
          _context3.next = 8;
          return regeneratorRuntime.awrap(model.load(dirs[i]));

        case 8:
          models.push(model);

        case 9:
          i++;
          _context3.next = 4;
          break;

        case 12:
          images = fs.readdirSync(config.enchanceDir).map(function (img) {
            return path.join(config.enchanceDir, img);
          }).map(function (img) {
            try {
              return sharp(img).png().ensureAlpha();
            } catch (e) {}

            return null;
          }).filter(function (img) {
            return img !== null;
          });
          _i2 = 0;

        case 14:
          if (!(_i2 < images.length)) {
            _context3.next = 30;
            break;
          }

          img = images[_i2];
          j = 0;

        case 17:
          if (!(j < models.length)) {
            _context3.next = 27;
            break;
          }

          _model = models[_i2];
          _context3.next = 21;
          return regeneratorRuntime.awrap(enchance(img, _model));

        case 21:
          output = _context3.sent;
          console.log(output, 'ok');
          process.exit();

        case 24:
          j++;
          _context3.next = 17;
          break;

        case 27:
          _i2++;
          _context3.next = 14;
          break;

        case 30:
        case "end":
          return _context3.stop();
      }
    }
  });
})();