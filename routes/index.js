/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
const express = require('express');
const FilesController = require('../controllers/FilesController');

const router = express.Router();

router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);

router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);

module.exports = router;
