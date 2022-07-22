import { ethers } from 'ethers'
import { network } from './constants'

const apiKey = process.env.INFURA_API_KEY

export const provider = new ethers.providers.InfuraWebSocketProvider(network, apiKey)
