import { config } from 'dotenv'

if (process.env.TS_NODE_DEV === 'true') {
  config()
}

import { TRXScraper } from './trx'
import { ETHScraper, ETHWalletPair } from './eth'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'

const { RUN_ETH, RUN_TRX } = process.env

const runETH = JSON.parse(RUN_ETH)
const runTRX = JSON.parse(RUN_TRX)
console.log('🚀 ~ runETH', runETH)
console.log('🚀 ~ runTRX', runTRX)

if (runTRX) {
  console.log('Started TRX scraping')
  const trxScraper = new TRXScraper()
  trxScraper.start()
}

if (runETH) {
  const files = readdirSync(path.join(process.cwd(), 'wallets-eth'))
  const activeFiles = files.filter((f) => f.endsWith('_active.json'))

  const wallets = activeFiles
    .map((af) => {
      const file = readFileSync(path.join(process.cwd(), 'wallets-eth', af), { encoding: 'utf-8' })
      try {
        return JSON.parse(file)
      } catch {
        return null
      }
    })
    .filter(Boolean) as ETHWalletPair[]

  wallets.forEach((wallet) => {
    const ethScraper = new ETHScraper(wallet)
    ethScraper.start()
  })
}
