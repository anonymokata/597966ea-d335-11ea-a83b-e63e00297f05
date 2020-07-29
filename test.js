const assert = require('assert');
const moment = require('moment');
const { 
  perMinute, 
  parseTime, 
  checkForNextDay,
  findClosestShiftToFullHour,
  roundToNearestHour,
  calculatePay, 
} = require('./client');

describe('client.js', function() {
  beforeEach(function () {
    // resets startOfDay 
    startOfDay = moment().hour(17).minute(0).second(0).millisecond(0);
  });
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
  describe('checkForNextDay()', function() {
    it('Should add one to the moment() day if hour is less than 12 miltary time, adds one to moment() day', function() {
      let testMoment = moment().set('hour', 3).set('minute', 0);
      testMoment = checkForNextDay(testMoment);
      assert.equal(testMoment.day(), startOfDay.add(1, 'day').day());
    });
  });
  describe('checkForNextDay()', function() {
    it('Should not add one to the moment() day if hour is greater than 12 miltary time', function() {
      let testMoment = moment().set('hour', 19).set('minute', 0);
      testMoment = checkForNextDay(testMoment);
      assert.equal(testMoment.day(), startOfDay.day());
    });
  });
  describe('findClosestShiftToFullHour', function() {
    it('Should confirm the index in the array of a shift with time closest to 60 minutes, but not divisible by 60', function() {
      assert.equal(1, findClosestShiftToFullHour([60,45,0]));
    });
  });
  describe('findClosestShiftToFullHour', function() {
    it('Should return null if no shift needs adjusted', function() {
      assert.equal(null, findClosestShiftToFullHour([60,0]));
    });
  });
  describe('roundToTheNearestHour()', function() {
    it('Should return the array unadjusted', function() {
      assert.deepEqual([60, 0, 45, 15], roundToNearestHour([60,0,45,15]));
    });
  });
  describe('roundToTheNearestHour()', function() {
    it('Should return the array with the third spot brought to 45 for the missing time', function() {
      assert.deepEqual([60, 0, 45, 15], roundToNearestHour([60,0,40,15]));
    });
  });
  
  describe('roundToTheNearestHour()', function() {
    it('Should return the array with the second spot brought to 75 for the missing time', function() {
      assert.deepEqual([30, 75, 0, 15], roundToNearestHour([30,40,0,15]));
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
  describe('calculatePay()', function() {
    it('Should return 190.00 for family A full shift', function() {
      assert.equal(190.00, calculatePay('a', '5:00pm', '4:00am'));
    });
  });
  describe('calculatePay()', function() {
    it('Should return 24.00 for family B for a two hour shift in 1st shift', function() {
      assert.equal(24.00, calculatePay('b', '5:30pm', '7:30pm'));
    });
  });
  describe('calculatePay()', function() {
    it('Should return 18.00 for family C for a one hour shift across the shift change', function() {
      assert.equal(18.00, calculatePay('c', '8:30pm', '21:30'));
    });
  });
  describe('calculatePay()', function() {
    it('Should return 100.00 for a 5.5hr shift from 7pm to 12:30am for family A', function() {
      assert.equal(100.00, calculatePay('a', '19:00', '0:30'));
    });
  });
});