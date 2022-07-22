import { ethers } from 'ethers'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import { gasLimit, networkId } from './constants'
import { provider } from './provider'

export type Wallet = {
  privateKey: string
  address: string
  mnemonic: string
}
export type ETHWalletPair = {
  bait: Wallet
  dest: Wallet
}

const eutils = ethers.utils

export class ETHScraper {
  constructor(private walletPair: ETHWalletPair) {}

  private intervalId: NodeJS.Timer
  private address: NodeJS.Timer
  private scrapInterval = JSON.parse(process.env.ETH_INTERVAL || '1000')

  wait = false

  start = () => {
    provider.on('block', this.task)
  }

  task = async () => {
    console.log(new Date().toLocaleString())
    if (this.wait) {
      console.log('Wait')
      return
    }

    const { bait, dest } = this.walletPair

    try {
      const wallet = new ethers.Wallet(bait.privateKey, provider)

      const balance = await wallet.getBalance()

      const balanceEth = eutils.formatEther(balance)
      console.log('🚀 ~ Balance', balanceEth, ' ETH', wallet.address)

      if (eutils.parseEther(balanceEth).gt(0)) {
        const feeData = await wallet.getFeeData()
        const { maxFeePerGas, maxPriorityFeePerGas } = feeData

        const gasTotalWei = maxFeePerGas.add(maxPriorityFeePerGas).mul(gasLimit)

        const transferWei = balance.sub(gasTotalWei)
        console.log('🚀 ~ transferEth', eutils.formatEther(transferWei))

        const nonce = await wallet.getTransactionCount()

        if (transferWei.gt(0)) {
          this.wait = true
          const tx = await wallet.sendTransaction({
            to: dest.address,
            value: transferWei,
            type: 2,
            chainId: networkId,
            maxFeePerGas,
            maxPriorityFeePerGas,
            nonce,
            gasLimit: 21000,
          })
          await tx.wait(7)
          console.log('🚀 ~ tx', tx)
        }
      }
    } catch (error) {
      console.log('🚀 ~ file: task.ts ~ line 36 ~ promises ~ error', error)
    } finally {
      this.wait = false
    }
  }
}
