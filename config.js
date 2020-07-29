const moment = require('moment');

const FAMILIES = [
  {
    name: 'Addams',
    shortened: 'a',
    shifts: [
      {
        end: 23,
        pay:15
      },
      {
        end: 4,
        pay: 20
      }
    ]
  },
  {
    name: 'Bennett',
    shortened: 'b',
    shifts: [
      {
        end: 22,
        pay: 12
      },
      {
        end: 0,
        pay: 8
      },
      {
        end: 4,
        pay: 16
      }
    ]
  },
  {
    name: 'Church',
    shortened: 'c',
    shifts: [
      {
        end: 21,
        pay: 21
      },
      {
        end: 4,
        pay: 15
      }
    ]
  }
]

const startOfDay = moment({
  'hour': 17
});

const endOfDay = moment(startOfDay).add(11, 'hours');


exports.FAMILIES = FAMILIES;
exports.startOfDay = startOfDay;
exports.endOfDay = endOfDay;