const express = require('express');
const app = express();

app.get('/perlin-noise',function(req,res){
    res.sendFile('index.html',{
        root: __dirname + '/examples/perlin-noise'
    });
});

app.get('/perlin-noise/index.js',function(req,res){
    res.sendFile('index.js',{
        root: __dirname + '/examples/perlin-noise/'
    });
});

app.get('/perlin-noise/model/model.json',function(req,res){
    res.sendFile('model.json',{
        root: '/app/models/'
    });
});

app.listen(3000);