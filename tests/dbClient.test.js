const { expect } = require('chai');
const dbClient = require('../utils/db');

describe('dbClient', () => {
  // eslint-disable-next-line jest/prefer-expect-assertions
  it('should connect to MongoDB', () => {
    // eslint-disable-next-line jest/valid-expect
    expect(dbClient.isAlive()).to.equal(true);
  });

  // eslint-disable-next-line jest/prefer-expect-assertions
  it('should return the correct database stats', async () => {
    const stats = await dbClient.nbUsers();
    // eslint-disable-next-line jest/valid-expect
    expect(stats).to.be.a('number');
  });
});
