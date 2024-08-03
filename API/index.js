const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const expressRateLimit = require('express-rate-limit')
const { requestLogger, errorLogger } = require('./middlewares/logger')
const { scheduleMoscowReset } = require('./utils/regionalResets')
require('dotenv').config()
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const MONGODB_URL = process.env.MONGODB_URL

const { PORT = 3000 } = process.env

const app = express()

app.use(express.json())

const limit = expressRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Превышен лимит запросов',
})

app.use(cors({ origin: ['http://localhost:3001', 'https://github-trending-repositories-react.vercel.app'], credentials: true }))

mongoose.connect(MONGODB_URL)
// mongoose.connect('mongodb://127.0.0.1:27017/topRepositories')

app.use('/', require('./routes/repoRoutes'))

app.use(limit)

app.use(requestLogger)

app.use(errorLogger)

scheduleMoscowReset()

app.get('/', (req, res) => {
	res.status(200)
	res.json({ message: 'Server running!' })
	res.end()
})

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'Произошла ошибка в работе сервера'
        : message,
    })
  next()
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
}) 