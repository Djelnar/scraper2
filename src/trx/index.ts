import { task } from './task'

export class TRXScraper {
  private intervalId: NodeJS.Timer

  start = () => {
    this.intervalId = setInterval(task, 60_000)
  }
}
