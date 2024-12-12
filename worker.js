const Queue = require('bull');
const fs = require('fs');
// eslint-disable-next-line no-unused-vars
const path = require('path');
const imageThumbnail = require('image-thumbnail');
const { ObjectId } = require('mongodb');
const dbClient = require('./utils/db');

const fileQueue = new Queue('fileQueue');

// eslint-disable-next-line consistent-return
fileQueue.process(async (job, done) => {
  const { userId, fileId } = job.data;

  if (!fileId) return done(new Error('Missing fileId'));
  if (!userId) return done(new Error('Missing userId'));

  const file = await dbClient.files.findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });
  if (!file) return done(new Error('File not found'));

  const filePath = file.localPath;

  try {
    const sizes = [500, 250, 100];
    for (const size of sizes) {
      // eslint-disable-next-line no-await-in-loop
      const thumbnail = await imageThumbnail(filePath, { width: size });
      fs.writeFileSync(`${filePath}_${size}`, thumbnail);
    }
    done();
  } catch (err) {
    done(err);
  }
});

// ========================

// const Bull = require('bull');
// const dbClient = require('./db');

// const userQueue = new Bull('userQueue');

// userQueue.process(async (job) => {
//   const { userId } = job.data;
//   if (!userId) throw new Error('Missing userId');

//   const user = await dbClient.db.collection('users').findOne({ _id: new dbClient.ObjectId(userId) });
//   if (!user) throw new Error('User not found');

//   console.log(`Welcome ${user.email}!`);
// });
