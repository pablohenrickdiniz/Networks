let {Noise} = require('noisejs');
let HeightMap = function(options){
    let self = this;
    options = options || {};
    self.seed = options.seed || 0;
    self.iterations = options.iterations ;
    self.scale = options.scale;
    self.fields = options.fields || [];

    Object.defineProperty(self,'size',{
        get:function(){
            return self.fields.reduce(function(a,b){
                return a + b.portion;
            },0);
        }
    });
};

HeightMap.prototype.get = function(x,y){
    let self = this;
    let nx = x / self.scale;
    let ny = y / self.scale;
    let val = 0;
    let e = 0;
    let noise = new Noise(self.seed);
    for(let k =1 ; k<= self.iterations;k++){
        e = Math.pow(2,k);
        val += 1/k*noise.perlin2(nx*e,ny*e);
    }
    return Math.abs(val);
};

HeightMap.prototype.getField = function(x,y){
    return this.getFieldFromLevel(self.get(x,y));
};

HeightMap.prototype.getFieldFromLevel = function(level){
    let self = this;
    let start = 0;
    let end = 0;
    let size = self.size;
    let field;

    for(let i = 0; i < self.fields.length;i++){
        field = self.fields[i];
        let portion = field.portion/size;
        end = start + portion;
        
        if(level >= start && level <= end){
            return field;
        }
        start = end;
    }
    return field;
};

HeightMap.prototype.addField = function(name,portion,color){
    let self = this;
    portion = portion || 1;
    color = color || '#FFFFFF';
    self.fields.push({
        name:name,
        portion:portion,
        color:color
    });
};

HeightMap.prototype.removeField = function(name){
    let self = this;
    for(let i = 0; i < self.fields.length;i++){
        let field = self.fields[i];
        if(field.name === name){
            self.fields.splice(i,1);
            i--;
        }
    }
};

module.exports = HeightMap;