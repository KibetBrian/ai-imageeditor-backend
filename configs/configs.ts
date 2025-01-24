export const thirdPartyApiConfigs = {
  stabilityAi: {
    imageGeneration:{
      models:{
        ultra:{
          endpoint: 'https://api.stability.ai/v2beta/stable-image/generate/ultra',
          credits: 8
        },
        core:{
          endpoint: 'https://api.stability.ai/v2beta/stable-image/generate/core',
          credits: 3
        },
        sd3:{
          endpoint: 'https://api.stability.ai/v2beta/stable-image/generate/sd3',
          credits: 6.5
        }
      }
    },
    
    backgroundRemoval: {
      endpoint: 'https://api.stability.ai/v2beta/stable-image/edit/remove-background',
      credits: 2
    },

    objectErasal:{
      endpoint: 'https://api.stability.ai/v2beta/stable-image/edit/erase',
      credits: 3
    },
    outpainting:{
      endpoint: 'https://api.stability.ai/v2beta/stable-image/edit/outpaint',
      credits: 1
    }
  }
};