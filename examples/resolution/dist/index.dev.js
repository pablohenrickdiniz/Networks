"use strict";

var currentImage;
var models = ['16x16_32x32_conv2d_256_relu_upSampling2d_linear_conv2d_4_relu_dropout_linear', '32x32_64x64_conv2d_512_relu_upSampling2d_linear_conv2d_4_relu_dropout_linear'];

function loadModels(callback) {
  var promises = [];

  for (var i = 0; i < models.length; i++) {
    var promise = tf.loadLayersModel('models/' + models[i] + '/model.json');
    promises.push(promise);
  }

  Promise.all(promises).then(callback);
}

function load() {
  var input = document.getElementById('image');
  input.addEventListener('change', function (e) {
    if (e.target.files[0]) {
      var file = e.target.files[0];

      if (['image/png', 'image/jpeg'].indexOf(file.type) !== -1) {
        var img = new Image();
        img.src = URL.createObjectURL(file);
        img.addEventListener('load', function () {
          currentImage = img;
          refresh();
        });
      }
    }
  });
}

function enhance(callback) {
  var data = getContext().getImageData(0, 0, 512, 512);
  var px = tf.browser.fromPixels(data, 4);
  var pieces = px.split([128, 128, 4]);
  console.log(pieces); //  px = tf.image.resizeBilinear(px,[32,32]);
  // loadModels(function(m){
  //     if(m[0]){
  //         px = m[0].predict(px.expandDims()).squeeze();
  //         px = tf.image.resizeBilinear(px,[64,64]).round().toInt();
  //         tf.browser.toPixels(px).then(function(c){
  //             var iData = new ImageData(c, 64,64);
  //             getContext().clearRect(0,0,600,600);
  //             getContext().putImageData(iData, 0, 0);
  //             if(callback){
  //                 callback();
  //             }
  //         });
  //     }
  // });
}

function refresh() {
  if (currentImage) {
    var ctx = getContext();
    ctx.drawImage(currentImage, 0, 0, 512, 512);
    enhance();
  }
}

function getContext() {
  return getCanvas().getContext('2d');
}

function getCanvas() {
  return document.getElementById('canvas');
}