const { expect } = require('chai');
const redisClient = require('../utils/redis');

describe('redisClient', () => {
  it('should connect to Redis', () => new Promise((done) => {
    // eslint-disable-next-line jest/valid-expect
    expect(redisClient.isAlive()).to.equal(true);
    done();
  }));

  // eslint-disable-next-line jest/prefer-expect-assertions
  it('should set and get keys', async () => {
    await redisClient.set('test_key', 'test_value', 10);
    const value = await redisClient.get('test_key');
    // eslint-disable-next-line jest/valid-expect
    expect(value).to.equal('test_value');
  });
});
