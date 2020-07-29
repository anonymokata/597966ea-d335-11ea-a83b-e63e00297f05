const assert = require('assert');
const moment = require('moment');
const { calculatePay, FAMILIES, startOfDay, parseTime } = require('./client');

describe('client.js', function() {
  describe('parseTime()', function() {
    it('Should regex a passed in time military or signed, and return a moment', function() {
      const testMoment = moment().set('hour', 17).set('minute', 0);
      assert.equal(testMoment.format('HH:mm'), parseTime("5:00pm").format('HH:mm'));
    });
  });
  describe('parseTime()', function() {
    it('Should fail regex test, returning null', function() {
      assert.equal(null, parseTime("5:00pma"));
    });
  });
  describe('calculatePay()', function() {
    it('Should not calculate without all 3 family, start, and end', function() {
      assert.equal(null, calculatePay(null, null, null));
    });
  });
  describe('calculatePay()', function() {
    it('Should not calculate without a family, start, and end', function() {
      assert.equal(null, calculatePay('a', null, null));
    });
  });
  describe('calculatePay()', function() {
    it('Should return 190.00 for family A full shift', function() {
      assert.equal(190.00, calculatePay('a', '5:00pm', '4:00am'));
    });
  });
});