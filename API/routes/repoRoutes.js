const router = require('express').Router()
const {
  getRepo,
  getAddedRepo,
  startTimer,
  stopTimer,
} = require('../controllers/repoControllers')

router.get('/repositories', getRepo);

router.get('/repositories/:nameOrId', getAddedRepo);

router.get('/sync/start', startTimer);

router.get('/sync/force', stopTimer);

module.exports = router;