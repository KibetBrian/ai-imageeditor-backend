export const thirdPartyApiConfigs = {
  stabilityAi: {
    baseUrl: 'https://api.stability.ai/v2beta/stable-image/generate',
    models: [
      {
        name: 'ultra',
        endpoint: 'https://api.stability.ai/v2beta/stable-image/generate/ultra'
      },
      {
        name: 'core',
        endpoint: 'https://api.stability.ai/v2beta/stable-image/generate/core'
      },
      {
        name: 'sd3',
        endpoint: 'https://api.stability.ai/v2beta/stable-image/generate/sd3'
      }
    ],
    
    backgroundRemoval: {
      endpoint: 'https://api.stability.ai/v2beta/stable-image/edit/remove-background',
      credits: 2
    },
    objectErasal:{
      endpoint: 'https://api.stability.ai/v2beta/stable-image/edit/erase',
      credits: 3
    }
  }
};