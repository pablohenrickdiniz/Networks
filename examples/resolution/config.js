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
        {
            input:[16,16], 
            output:[32,32],
            layers:[
                {type:'conv2d',filters:'256',activation:'relu'},
                {type:'upSampling2d',size:[2,2]},
                {type:'conv2d',filters:3,activation:'relu'}
            ]
        },
    
        {
            input:[32,32],
            output:[64,64],
            layers:[
                {type:'conv2d',filters:'512',activation:'relu'},
                {type:'upSampling2d',size:[2,2]},
                {type:'conv2d',filters:3,activation:'relu'},
            ]
        },
      
        {
            input:[64,64],
            output:[128,128],
            layers:[
                {type:'conv2d',filters:'256',activation:'relu'},
                {type:'upSampling2d',size:[2,2]},
                {type:'conv2d',filters:3,activation:'relu'}
            ]
        },
     
        {
            input:[128,128],
            output:[256,256],
            layers:[
                {type:'conv2d',filters:'128',activation:'relu'}, 
                {type:'upSampling2d',size:[2,2]},
                {type:'conv2d',filters:3,activation:'relu'}
            ]
        },
       
        {
            input:[256,256],
            output:[512,512],
            layers:[
                {type:'conv2d',filters:'128',activation:'relu'},
                {type:'upSampling2d',size:[2,2]},
                {type:'conv2d',filters:3,activation:'relu'}
            ]
        },
        // {
        //     input:[512,512],
        //     output:[1024,1024],
        //     layers:[
        //         {type:'conv2d',filters:'1|2|4|8|16|32|64|128|256|512',activation:'relu'},
        //         {type:'upSampling2d',size:[2,2]},
        //         {type:'conv2d',filters:3,activation:'relu'}
        //     ]
        // },
        // {
        //     input:[1024,1024],
        //     output:[2048,2048],
        //     layers:[
        //         {type:'conv2d',filters:'1|2|4|8|16|32|64|128|256|512',activation:'relu'},
        //         {type:'upSampling2d',size:[2,2]},
        //         {type:'conv2d',filters:3,activation:'relu'}
        //     ]
        // }
    ],
    imagesDir:'/content/drive/MyDrive/ia-projects/resolution/images',
    resolutionsDir:'/content/drive/MyDrive/ia-projects/resolution/resolutions',
    modelsDir:'/content/drive/MyDrive/ia-projects/resolution/models',
    outputsDir:'/content/drive/MyDrive/ia-projects/resolution/outputs'
};