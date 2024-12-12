/* eslint-disable jest/valid-expect */
/* eslint-disable no-unused-expressions */
const Bull = require('bull');
const chai = require('chai');
const dbClient = require('../utils/db');

const { expect } = chai;

describe('userQueue Worker', () => {
  const userQueue = new Bull('userQueue');

  it('should process a job and print a welcome message', () => new Promise((done) => {
    userQueue.process(async (job) => {
      const { userId } = job.data;
      expect(userId).to.exist;
      const user = await dbClient.db.collection('users').findOne({ _id: userId });
      expect(user).to.exist;
      expect(user.email).to.exist;
      done();
    });

    userQueue.add({ userId: 'someValidUserId' }); // Replace with a valid test userId
  }));
});
