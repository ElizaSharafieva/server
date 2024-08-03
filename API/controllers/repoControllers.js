const Repo = require('../model/repoSchema')
const NotFoundError = require('../errors/NotFoundError')
const { getNextResetTime } = require('../utils/regionalResets')
const { startSync, syncStatus } = require('../utils/startSync')

let autoSyncTimer = null
const minutes = 60

async function getRepos(req, res, next) {
  try {
    const repositories = await Repo.find().sort({ daily_stars: -1 })
    const nextResetTime = getNextResetTime()
    res.json({ repositories, nextResetTime })
  } catch (error) {
    res.status(500).json({ error: 'Error fetching repositories' })
  }
}

async function getAddedRepo(req, res, next) {
  const identifier = req.params.nameOrId
  try { 
    const repository = await Repo.findOne({ $or: [{ id: identifier }, { name: identifier }, { login: identifier }] })
    if (!repository) {
      throw new NotFoundError('Репозиторий не найден')
    } else {
      res.json(repository)
    }
  } catch(error) {
		res.status(500).json({ message: error.message })
  } 
}

async function startTimer(req, res) {
  try {
    if (autoSyncTimer) {
      res.status(208).json({ message: 'Auto sync already started!', nextSyncTime: syncStatus.nextSyncTime })
    } else {
      autoSyncTimer = setInterval(async () => {
        await startSync()
      }, minutes * 60 * 1000)
      await startSync()
      res.json({ message: 'Auto sync started!', nextSyncTime: syncStatus.nextSyncTime })
    }
  } catch (error) {
    if (error.statusCode === 403) {
      res.status(403).json({ message: 'Error: ' + error.message })
    } else { 
      res.status(500).json({ message: 'Error: ' + error.message })
    }
  }
}

async function stopTimer(req, res) {
  try {
    if (autoSyncTimer) {
      clearInterval(autoSyncTimer)
      autoSyncTimer = null
      await startSync()
      autoSyncTimer = setInterval(async () => {
        await startSync()
      }, minutes * 60 * 1000)
      res.json({ message: 'Auto sync reset!', nextSyncTime: syncStatus.nextSyncTime })
    } else {
      res.status(208).json({ message: 'Auto sync already disabled!' })
    }
  } catch (error) {
    if (error.statusCode === 403) {
      res.status(403).json({ message: 'Error: ' + error.message })
    } else { 
      res.status(500).json({ message: 'Error: ' + error.message })
    }
  }
}

module.exports = {
  getRepos,
  getAddedRepo,
  startTimer,
  stopTimer,
}