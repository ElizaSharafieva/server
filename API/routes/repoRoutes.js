const router = require('express').Router()
const {
  getRepos,
  getAddedRepo,
  startTimer,
  stopTimer,
} = require('../controllers/repoControllers')

router.get('/repositories', getRepos);

router.get('/repositories/:nameOrId', getAddedRepo);

router.post('/sync/start', startTimer);

router.post('/sync/force', stopTimer);

module.exports = router;