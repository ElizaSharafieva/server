const Repo = require('../model/repoSchema')

let timeToNextResetGlobal = null

async function resetDailyStarsForMoscow() {
  const currentDate = new Date()
  await Repo.updateMany({}, { daily_stars: 0, last_synced: currentDate })
}

function scheduleMoscowReset() {
  const now = new Date()

  const moscowOffset = 3 * 60
  const currentUtcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000
  const moscowTime = new Date(currentUtcTime + moscowOffset * 60 * 1000)

  const nextReset = new Date(
    moscowTime.getFullYear(),
    moscowTime.getMonth(),
    moscowTime.getDate(),
    0, 0, 0
  )

  if (moscowTime.getHours() >= 0 && moscowTime.getMinutes() > 0) {
    nextReset.setDate(nextReset.getDate() + 1)
  }

  const timeToNextReset = nextReset.getTime() - moscowTime.getTime()
  timeToNextResetGlobal = nextReset

  setTimeout(() => {
    resetDailyStarsForMoscow()

    setInterval(resetDailyStarsForMoscow, 24 * 60 * 60 * 1000)
  }, timeToNextReset)
}

function getNextResetTime() {
  return timeToNextResetGlobal
}

module.exports = {
  scheduleMoscowReset,
  getNextResetTime
}