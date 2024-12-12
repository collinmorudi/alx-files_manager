/* eslint-disable consistent-return */
// eslint-disable-next-line import/extensions
import redisClient from '../utils/redis.js';

class UsersController {
  // ... existing methods

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
