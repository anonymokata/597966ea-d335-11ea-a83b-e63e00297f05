const assert = require('assert');
const moment = require('moment');
const { calculatePay, FAMILIES, startOfDay, parseTime, perMinute, checkForNextDay } = require('./client');

describe('client.js', function() {
  describe('perMinute()', function() {
    it('Should return a per hour pay rate at a per minute pay rate', function() {
      assert.equal(.25, perMinute(15));
    });
  });
  describe('perMinute()', function() {
    it('Should return null if not passed a number', function() {
      assert.equal(null, perMinute('green'));
    });
  });
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
    it('Should not calculate without all bad arguments', function() {
      assert.equal(null, calculatePay(null, null, null));
    });
  });
  describe('calculatePay()', function() {
    it('Should not calculate without all 3 - family, start, and end', function() {
      assert.equal(null, calculatePay('a', null, null));
    });
  });
  describe('calculatePay()', function() {
    it('Should return 190.00 for family A full shift', function() {
      assert.equal(190.00, calculatePay('a', '5:00pm', '4:00am'));
    });
  });
  describe('calculatePay()', function() {
    it('Should return null for shift starting before 5:00pm', function() {
      assert.equal(null, calculatePay('a', '4:00pm', '4:00am'));
    });
  });
  describe('calculatePay()', function() {
    it('Should return null for shift ending after 4:00am', function() {
      assert.equal(null, calculatePay('a', '5:00pm', '5:00am'));
    });
  });
  describe('calculatePay()', function() {
    it('Should return null for shift ending before start time', function() {
      assert.equal(null, calculatePay('a', '7:00pm', '6:00m'));
    });
  });
  describe('calculatePay()', function() {
    it('Should return null for shift starting after end time', function() {
      assert.equal(null, calculatePay('a', '1:00am', '11:30pm'));
    });
  });
});