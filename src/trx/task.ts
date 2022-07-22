import { fullNodeEndpoint } from './constants'
import TronWeb from 'tronweb'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'

export const tronWeb = new TronWeb({
  fullHost: fullNodeEndpoint,
  headers: {
    'TRON-PRO-API-KEY': process.env.TRONGRID_API_KEY,
  },
})

const files = readdirSync(path.join(process.cwd(), 'wallets-trx'))
const activeFiles = files.filter((f) => f.endsWith('_active.json'))

const wallets = activeFiles
  .map((af) => {
    const file = readFileSync(path.join(process.cwd(), 'wallets-trx', af), { encoding: 'utf-8' })
    try {
      return JSON.parse(file)
    } catch {
      return null
    }
  })
  .filter(Boolean)

export const task = async () => {
  console.log(new Date().toLocaleString())
  const promises = wallets.map(async ({ bait, dest }) => {
    try {
      const balance = await tronWeb.trx.getBalance(bait.address)
      const balanceTrx = tronWeb.fromSun(balance)

      console.log(`🚀 ~ Address: ${bait.address}, Balance: ${balanceTrx} TRX`)

      if (balanceTrx >= 100) {
        const transferValue = balance - 3_000_000 // Fee
        console.log('🚀 ~ transferValue', tronWeb.fromSun(transferValue))

        const tx = await tronWeb.transactionBuilder.sendTrx(dest.address, transferValue, bait.address)
        const signedTx = await tronWeb.trx.sign(tx, bait.privateKey)
        const receipt = await tronWeb.trx.sendRawTransaction(signedTx)
        if (receipt.result === true) {
          console.log(receipt.txid)
        }
      }
    } catch (error) {
      console.log('🚀 ~ file: task.ts ~ line 41 ~ promises ~ error', error)
    }
  })

  await Promise.allSettled(promises)
}
