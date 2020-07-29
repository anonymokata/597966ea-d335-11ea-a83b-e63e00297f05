const assert = require('assert');
const moment = require('moment');
const { calculatePay, FAMILIES, startOfDay, parseTime } = require('./client');

describe('client.js', function() {
  describe('parseTime()', function() {
    it('Should regex a passed in time military or signed, and return a moment', function() {
      const testMoment = moment({hour:17, minute:0}).format('HH:mm');
      assert.equal(testMoment, parseTime("5:00pm"));
    });
  });
  describe('parseTime()', function() {
    it('Should fail regex test, returning null', function() {
      const testMoment = moment({hour:17, minute:0}).format('HH:mm');
      assert.equal(null, parseTime("5:00pma"));
    });
  });
});