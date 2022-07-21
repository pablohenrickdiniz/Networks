module.exports = {
    resolutions:[
        [8,8],
        [16,16],
        [32,32],
        [64,64],
        [128,128],
        [256,256],
        [512,512],
        [1024,1024],
        [2048,2048]
    ],
    train:[
        {input:[16,16],output:[32,32]},
        {input:[32,32],output:[64,64]},
        {input:[64,64],output:[128,128]},
        {input:[128,128],output:[256,256]},
        {input:[256,256],output:[512,512]},
        {input:[512,512],output:[1024,1024]},
      //  {input:[1024,1024],output:[2048,2048]},
        //test
        {
            input:[128,128],
            output:[2048,2048],
            layers:[
                //128 -> 256
                {type:'conv2d',filters:'8|16|32|64|128|512',activation:'elu'},
                {type:'conv2d',filters:3,activation:'relu'},
                {type:'upSampling2d',size:[2,2]},

                //256 -> 512
                {type:'conv2d',filters:'8|16|32|64|128|512',activation:'elu'},
                {type:'conv2d',filters:3,activation:'relu'},
                {type:'upSampling2d',size:[2,2]},

                 //512 -> 1024
                 {type:'conv2d',filters:'8|16|32|64|128|512',activation:'elu'},
                 {type:'conv2d',filters:3,activation:'relu'},
                 {type:'upSampling2d',size:[2,2]},

                  //1024 -> 2048
                  {type:'conv2d',filters:'8|16|32|64|128|512',activation:'elu'},
                  {type:'conv2d',filters:3,activation:'relu'},
                  {type:'upSampling2d',size:[2,2]}
            ]
        }
    ],
    imagesDir:'/content/drive/MyDrive/ia-projects/resolution/images',
    resolutionsDir:'/content/drive/MyDrive/ia-projects/resolution/resolutions',
    modelsDir:'/content/drive/MyDrive/ia-projects/resolution/models',
    outputsDir:'/content/drive/MyDrive/ia-projects/resolution/outputs'
};