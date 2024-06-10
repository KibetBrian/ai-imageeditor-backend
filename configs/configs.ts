export const configs ={
  stableDiffusion: {
    baseUrl: 'https://api.stability.ai/v2beta/stable-image/generate',
    models:[
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
    ]
  }
};