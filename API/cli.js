const { program } = require('commander')
const axios = require('axios')

const APIURL = process.env.APIURL || 'http://localhost:3000'

program
  .version('1.0.0')
  .description('CLI для управления синхронизацией репозиториев')

program
  .command('start')
  .description('Запустить авто синхронизацию')
  .action(async () => {
    try {
      const response = await axios.post(`${APIURL}/sync/start`)
      console.log(response.data.message)
    } catch (err) {
      console.error('Ошибка при запуске авто синхронизации:', err.message)
    }
  })

program
  .command('stop')
  .description('Остановить авто синхронизацию и перезапустить')
  .action(async () => {
    try {
      const response = await axios.post(`${APIURL}/sync/force`)
      console.log(response.data.message)
    } catch (err) {
      console.error('Ошибка при остановке авто синхронизации:', err.message)
    }
  })

program
  .command('list')
  .description('Показать список репозиториев')
  .action(async () => {
    try {
      const response = await axios(`${APIURL}/repositories`)
      console.log(response.data)
    } catch (err) {
      console.error('Ошибка при получении списка репозиториев:', err.message)
    }
  })

program
  .command('show <nameOrId>')
  .description('Показать информацию о репозитории по ID, имени или логину')
  .action(async (nameOrId) => {
    try {
      const response = await axios(`${APIURL}/repositories/${nameOrId}`)
      console.log(response.data)
    } catch (err) {
      console.error('Ошибка при получении информации о репозитории:', err.message)
    }
  })

program.parse(process.argv)
