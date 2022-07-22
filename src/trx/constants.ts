const preset = {
  production: {
    endpoint: 'https://api.trongrid.io',
  },
  development: {
    // endpoint: 'https://api.trongrid.io',
    endpoint: 'https://api.shasta.trongrid.io',
  },
} as const

const mode = process.env.MODE as 'production' | 'development'

export const fullNodeEndpoint = preset[mode].endpoint
