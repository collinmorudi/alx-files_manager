/* eslint-disable import/extensions */
/* eslint-disable no-undef */
/* eslint-disable consistent-return */
// eslint-disable-next-line import/extensions
import crypto from 'crypto';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

const Bull = require('bull');

const userQueue = new Bull('userQueue');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // eslint-disable-next-line no-undef
    const userExists = await dbClient.db.collection('users').findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    const newUser = await dbClient.db.collection('users').insertOne({ email, password: hashedPassword });

    // Add job to the userQueue
    // eslint-disable-next-line no-unused-vars
    const job = await userQueue.add({ userId: newUser.insertedId });

    res.status(201).json({ id: newUser.insertedId, email });
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // eslint-disable-next-line no-undef
    const user = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.status(200).json({ id: user._id.toString(), email: user.email });
  }
}

export default UsersController;
