const { program } = require('commander');
const axios = require('axios');
const APIURL = process.env.APIURL || 'http://localhost:3000';

// program
//   .version('1.0.0')
//   .description('CLI для управления синхронизацией репозиториев');

// program
//   .command('start')
//   .description('Запустить авто синхронизацию')
//   .action(async () => {
//     try {
//       const response = await axios.post(`${APIURL}/sync/start`);
//       console.log(response.data.message);
//     } catch (err) {
//       console.error('Ошибка при запуске авто синхронизации:', err.message);
//     }
//   });

// program
//   .command('stop')
//   .description('Остановить авто синхронизацию и перезапустить')
//   .action(async () => {
//     try {
//       const response = await axios.post(`${APIURL}/sync/stop`);
//       console.log(response.data.message);
//     } catch (err) {
//       console.error('Ошибка при остановке авто синхронизации:', err.message);
//     }
//   });

// program.parse(process.argv);
