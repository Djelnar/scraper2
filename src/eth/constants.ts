import { Chain } from '@ethereumjs/common'

const preset = {
  production: {
    network: 'mainnet',
    networkId: Chain.Mainnet,
  },
  development: {
    network: 'goerli',
    networkId: Chain.Goerli,
  },
} as const

const mode = process.env.MODE as 'production' | 'development'

export const gasLimit = 21000
export const network = preset[mode].network
export const networkId = preset[mode].networkId
