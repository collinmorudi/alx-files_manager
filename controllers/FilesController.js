const Queue = require('bull');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

// Create a Bull queue for image thumbnail processing
const fileQueue = new Queue('fileQueue');

class FilesController {
  // eslint-disable-next-line consistent-return
  static async getShow(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const fileId = req.params.id;
    const file = await dbClient.db.collection('files').findOne({ _id: new dbClient.ObjectId(fileId), userId });

    if (!file) return res.status(404).json({ error: 'Not found' });

    res.status(200).json(file);
  }

  // eslint-disable-next-line consistent-return
  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { parentId = 0, page = 0 } = req.query;
    const pageSize = 20;
    const skip = page * pageSize;

    const files = await dbClient.db.collection('files')
      .aggregate([
        { $match: { userId, parentId } },
        { $skip: skip },
        { $limit: pageSize },
      ])
      .toArray();

    res.status(200).json(files);
  }

  // eslint-disable-next-line consistent-return
  static async putPublish(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const fileId = req.params.id;
    const file = await dbClient.db.collection('files').findOne({ _id: new dbClient.ObjectId(fileId), userId });

    if (!file) return res.status(404).json({ error: 'Not found' });

    await dbClient.db.collection('files').updateOne(
      { _id: new dbClient.ObjectId(fileId) },
      { $set: { isPublic: true } },
    );

    const updatedFile = await dbClient.db.collection('files').findOne({ _id: new dbClient.ObjectId(fileId) });
    res.status(200).json(updatedFile);
  }

  // eslint-disable-next-line consistent-return
  static async putUnpublish(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const fileId = req.params.id;
    const file = await dbClient.db.collection('files').findOne({ _id: new dbClient.ObjectId(fileId), userId });

    if (!file) return res.status(404).json({ error: 'Not found' });

    await dbClient.db.collection('files').updateOne(
      { _id: new dbClient.ObjectId(fileId) },
      { $set: { isPublic: false } },
    );

    const updatedFile = await dbClient.db.collection('files').findOne({ _id: new dbClient.ObjectId(fileId) });
    res.status(200).json(updatedFile);
  }

  static async getFile(req, res) {
    const { id } = req.params;
    const { userId } = req; // Assume middleware provides authenticated user ID
    const { size } = req.query;

    try {
      // eslint-disable-next-line no-undef
      const file = await dbClient.files.findOne({ _id: ObjectId(id) });

      if (!file) return res.status(404).json({ error: 'Not found' });

      if (file.type === 'folder') {
        return res.status(400).json({ error: "A folder doesn't have content" });
      }

      if (!file.isPublic && (!userId || file.userId.toString() !== userId.toString())) {
        return res.status(404).json({ error: 'Not found' });
      }

      let filePath = file.localPath;
      if (size) {
        const allowedSizes = ['100', '250', '500'];
        if (!allowedSizes.includes(size)) {
          return res.status(404).json({ error: 'Not found' });
        }
        filePath = `${filePath}_${size}`;
      }

      // eslint-disable-next-line no-undef
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Not found' });
      }

      // eslint-disable-next-line no-undef
      const mimeType = mime.lookup(file.name) || 'application/octet-stream';
      res.setHeader('Content-Type', mimeType);
      // eslint-disable-next-line no-undef
      const fileContent = fs.readFileSync(filePath);
      return res.status(200).send(fileContent);
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // eslint-disable-next-line consistent-return
  static async postFile(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // eslint-disable-next-line object-curly-newline
    const { name, type, data, parentId = 0, isPublic = false } = req.body;

    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type) return res.status(400).json({ error: 'Missing type' });
    if (type !== 'folder' && !data) return res.status(400).json({ error: 'Missing data' });

    const newFile = {
      userId,
      name,
      type,
      isPublic,
      parentId: parentId === 0 ? 0 : new dbClient.ObjectId(parentId),
      localPath: '',
    };

    if (type !== 'folder') {
      const filePath = `/tmp/${new dbClient.ObjectId()}`;
      // eslint-disable-next-line no-undef
      fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
      newFile.localPath = filePath;

      if (type === 'image') {
        fileQueue.add({ userId, fileId: new dbClient.ObjectId() });
      }
    }

    const result = await dbClient.db.collection('files').insertOne(newFile);
    res.status(201).json({ ...newFile, id: result.insertedId });
  }
}

module.exports = FilesController;
