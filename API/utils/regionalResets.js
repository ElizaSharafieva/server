const Repo = require('../model/repoSchema');

let timeToNextResetGlobal = null;

console.log('Москва сбрасывается!')

async function resetDailyStarsForMoscow() {
  const currentDate = new Date();
  // Сбрасываем дневные звезды для всех репозиториев
  await Repo.updateMany({}, { daily_stars: 0, last_synced: currentDate });
  
  console.log('Daily stars reset at 00:00 Moscow time!');
}

function scheduleMoscowReset() {
  const now = new Date();

  // Московское время (UTC+3)
  const moscowOffset = 3 * 60; // Смещение в минутах
  const currentUtcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const moscowTime = new Date(currentUtcTime + moscowOffset * 60 * 1000);

  // Вычисляем следующую 00:00 в московском времени
  const nextReset = new Date(
    moscowTime.getFullYear(),
    moscowTime.getMonth(),
    moscowTime.getDate(),
    0, 0, 0
  );

  // Если сейчас уже после 00:00, нужно установить время на следующий день
  if (moscowTime.getHours() >= 0 && moscowTime.getMinutes() > 0) {
    nextReset.setDate(nextReset.getDate() + 1);
  }

  const timeToNextReset = nextReset.getTime() - moscowTime.getTime();
  timeToNextResetGlobal = nextReset;

  console.log(timeToNextResetGlobal)

  // Устанавливаем таймер для сброса в 00:00 московского времени
  setTimeout(() => {
    resetDailyStarsForMoscow();

    // Затем устанавливаем интервал, чтобы сброс происходил каждые 24 часа
    setInterval(resetDailyStarsForMoscow, 24 * 60 * 60 * 1000);
  }, timeToNextReset);
}

function getNextResetTime() {
  return timeToNextResetGlobal;
}

module.exports = {
  scheduleMoscowReset,
  getNextResetTime
};