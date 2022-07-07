const express = require('express');
const app = express();

app.get('/examples/perlin-noise',function(req,res){
    res.sendFile('index.html',{
        root: __dirname + '/examples/perlin-noise'
    });
});

app.get('/examples/index.js',function(req,res){
    res.sendFile('index.js',{
        root: __dirname + '/examples/perlin-noise/'
    });
});

app.get('/examples/model/model.js',function(req,res){
    res.sendFile('model.js',{
        root: __dirname + '/examples/perlin-noise/model'
    });
});

app.listen(3000);