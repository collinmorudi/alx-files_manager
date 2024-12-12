/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */

/* eslint-disable import/extensions */
import { Router } from 'express';
import AppController from '../controllers/AppController.js';
import UsersController from '../controllers/UsersController.js';
// eslint-disable-next-line import/no-unresolved
import AuthController from '../controllers/AuthController.js';

// eslint-disable-next-line no-unused-vars
const express = require('express');
const FilesController = require('../controllers/FilesController');

const router = Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);

router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);
router.get('/files/:id/data', FilesController.getFile);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);

router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);

export default router;
