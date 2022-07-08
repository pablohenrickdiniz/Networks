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

app.use('/perlin-noise/model/', express.static('/app/models/perlin-noise'));

app.listen(3000);