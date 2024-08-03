const axios = require('axios')
const path = require('path')
const Repo = require('../model/repoSchema')
const ConflictRequestError = require('../errors/ConflictRequestError')
const ForbiddenError = require('../errors/ForbiddenError')
require('dotenv').config()
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

let syncStatus = {
  nextSyncTime: null,
}
const minutes = 60
const token = process.env.TOKEN
const perPage = 100
const totalPages = 10

async function createRepo(repo) {
  try {
    await Repo.create({
      id: repo.id,
      login: repo.owner.login,
      name: repo.name,
      avatar: repo.owner.avatar_url,
      ownerUrl: repo.owner.html_url,
      repoUrl: repo.html_url,
      description: repo.description,
      stargazers_count: repo.stargazers_count,
      last_synced: Date.now(),
    })
  } catch (err) {
    if (err.code === 11000) {
      throw new ConflictRequestError('Такой репозиторий уже существует')
    } else {
      throw err
    }
  }
}

async function fetchTopRepos(page) {
  try {
    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: 'stars:>10000',
        sort: 'stars',
        order: 'desc',
        per_page: perPage,
        page: page,
      },
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${token}`
      },
    })

    return response.data.items
  } catch (err) {
    if (err.code === 'ERR_BAD_REQUEST') {
      throw new ForbiddenError('Лимит запросов превышен')
    } else {
      throw err
    }
  }
}

async function startSync(req, res, next) {
  try {
    const fetchPromises = []
    for (let page = 1; page <= totalPages; page++) {
      fetchPromises.push(fetchTopRepos(page))
    }

    const allRepositories = await Promise.all(fetchPromises)
    const flattenedRepos = allRepositories.flat()

    const dbOperations = flattenedRepos.map(async (repo) => {
      const addedRepo = await Repo.findOne({ id: repo.id })
      if (addedRepo) {
        const starsToday = repo.stargazers_count - addedRepo.stargazers_count
        if (starsToday > 0) {
          addedRepo.daily_stars += starsToday
        }
        addedRepo.stargazers_count = repo.stargazers_count
        addedRepo.last_synced = Date.now()
        await addedRepo.save()
      } else {
        await createRepo(repo)
      }
    })

    await Promise.all(dbOperations)

    syncStatus.nextSyncTime = Date.now() + minutes * 60 * 1000
    console.log(`Auto sync started. Next sync scheduled for: ${new Date(syncStatus.nextSyncTime)}`)
  } catch (error) {
    console.log(error)
    throw error
  }
}

module.exports = {
  startSync,
  syncStatus,
}