const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const MONGODB_URL = process.env.MONGODB_URL;

const { PORT = 3000 } = process.env

const app = express()

app.use(express.json())

app.use(cors({ origin: ['http://localhost:3001', 'https://github-trending-repositories-react.vercel.app'], credentials: true }));

mongoose.connect(MONGODB_URL)
// mongoose.connect('mongodb://127.0.0.1:27017/topRepositories')

app.use('/', require('./routes/repoRoutes'))

app.get('/', (req, res) => {
	res.status(200);
	res.json({ message: 'Server running!' });
	res.end();
});

// app.use((err, req, res, next) => {

//   console.log(res.status)
//   console.log(res.message)
//   const { statusCode = 500, message } = err;

//   res
//     .status(statusCode)
//     .send({
//       message: statusCode === 500
//         ? 'Произошла ошибка в работе сервера'
//         : message,
//     });
//   next();
// });

// app.use('/*', (req, res, next) => {
//   next(new NotFoundError('Страница не найдена.'));
// });

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
}) 