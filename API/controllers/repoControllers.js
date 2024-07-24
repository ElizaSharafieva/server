const axios = require('axios');
const Repo = require('../model/repoSchema')

const ConflictRequestError = require('../errors/ConflictRequestError');

let autoSyncTimer = null;
let nextSyncTime = null;
const minutes = 720;

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
      last_synced: Date.now()
    })    
  } catch(err) {
    if (err.code === 11000) {
      throw new ConflictRequestError('Такой репозиторий уже существует')
    } else throw err;
  }
}

async function getRepos(req, res, next) {
  try {
    const repositories = await Repo.find().sort({ stargazers_count: -1 });
    res.json(repositories);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching repositories' });
  }
}

async function getAddedRepo(req, res, next) {
  const identifier = req.params.nameOrId;
  try { 
    const repository = await Repo.findOne({ $or: [{ id: identifier }, { name: identifier }, { login: identifier }] });
    if (repository === null) {
      res.json({ message: 'No data found!' });
    } else {
      res.json(repository);
    }
  } catch(err) {
		res.status(500).json({ message: 'Error: ' + err.message });
  } 
}

async function startSync(req, res, next) {
  try{
    const response = await axios.get('https://api.github.com/search/repositories?q=stars:>1&sort=stars&order=desc&per_page=10')
    const repositories = response.data.items;
    for (const repo of repositories) {
      const addedRepo = await Repo.findOne({ id: repo.id })
      if (addedRepo) {
        addedRepo.stargazers_count = repo.stargazers_count;
        addedRepo.last_synced = Date.now();
        await addedRepo.save();
      } else createRepo(repo)
    }
    nextSyncTime = Date.now() + minutes * 60 * 1000;
    console.log(`Auto sync started. Next sync scheduled for: ${new Date(nextSyncTime)}`);
  } catch(err) {
    console.log(err)
  }
}

async function startTimer(req, res) {
  try {
    if (autoSyncTimer) {
      res.status(208).json({ message: 'Auto sync already started!', nextSyncTime });
    } else {
      autoSyncTimer = setInterval(async () => {
        await startSync();
      }, minutes * 60 * 1000);
      await startSync()
      res.json({ message: 'Auto sync started!', nextSyncTime });
    }
  } catch (error) {
    console.log('Error: ' + error.message);
    res.status(500).json({ message: 'Error: ' + err.message });
  }
}

async function stopTimer(req, res) {
  try {
    if (autoSyncTimer) {
      clearInterval(autoSyncTimer);
      autoSyncTimer = null;
      await startSync()
      autoSyncTimer = setInterval(async () => {
        await startSync();
      }, minutes * 60 * 1000);
      res.json({ message: 'Auto sync reset!', nextSyncTime }); 
    } else {
      res.status(208).json({ message: 'Auto sync already disabled!' });
    }
  } catch (error) {
    console.log('Error: ' + error.message);
    res.status(500).json({ message: 'Error: ' + err.message });
  }
}

module.exports = {
  getRepos,
  getAddedRepo,
  startTimer,
  stopTimer,
};