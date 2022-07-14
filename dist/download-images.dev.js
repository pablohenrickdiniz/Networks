"use strict";

var fs = require('fs');

var imagesDir = '/content/drive/MyDrive/ia-projects/resolution/images';

var path = require('path');

var pexels = require('./api/pexels');

var axios = require('axios');

var total = 1000;
var minSize = 2048;
var ids = loadExistingIds();

function downloadImages(images, index) {
  var downloaded, i, image, name, outputFile, response;
  return regeneratorRuntime.async(function downloadImages$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          downloaded = 0;
          i = 0;

        case 2:
          if (!(i < images.length)) {
            _context.next = 21;
            break;
          }

          image = images[i];
          _context.prev = 4;
          name = path.basename(image);
          outputFile = path.join(imagesDir, name);
          _context.next = 9;
          return regeneratorRuntime.awrap(axios({
            method: 'GET',
            url: image,
            responseType: 'arraybuffer'
          }));

        case 9:
          response = _context.sent;
          fs.writeFileSync(outputFile, response.data);
          console.log("".concat(index, "/").concat(total, " - imagem ").concat(name, " salva com sucesso"));
          downloaded++;
          index++;
          _context.next = 18;
          break;

        case 16:
          _context.prev = 16;
          _context.t0 = _context["catch"](4);

        case 18:
          i++;
          _context.next = 2;
          break;

        case 21:
          return _context.abrupt("return", downloaded);

        case 22:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[4, 16]]);
}

function loadExistingIds() {
  return fs.readdirSync(imagesDir).map(function (img) {
    var match = img.match(/^pexels\-photo\-(\d+)\.jpeg$/);

    if (match && match[1]) {
      return parseInt(match[1]);
    }

    return null;
  }).filter(function (id) {
    return id !== null;
  });
}

(function _callee() {
  var downloaded, page, images;
  return regeneratorRuntime.async(function _callee$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, {
              recursive: true
            });
          }

          downloaded = ids.length;
          page = 1;

        case 3:
          if (!(downloaded < total)) {
            _context2.next = 16;
            break;
          }

          _context2.next = 6;
          return regeneratorRuntime.awrap(pexels({
            page: page,
            per_page: 10
          }));

        case 6:
          _context2.t0 = function (img) {
            return ids.indexOf(img.id) === -1 && (img.width > minSize || img.height > minSize);
          };

          _context2.t1 = function (img) {
            return img.src.original;
          };

          images = _context2.sent.filter(_context2.t0).map(_context2.t1);
          _context2.t2 = downloaded;
          _context2.next = 12;
          return regeneratorRuntime.awrap(downloadImages(images, downloaded + 1));

        case 12:
          downloaded = _context2.t2 += _context2.sent;
          page++;
          _context2.next = 3;
          break;

        case 16:
        case "end":
          return _context2.stop();
      }
    }
  });
})();