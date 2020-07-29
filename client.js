const yargs = require('yargs');
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


checkForNextDay = (argMoment) => {
  if (argMoment.hour() < 12) {
    return argMoment.day(startOfDay.day()).add(1, 'day');
  } else {
    return argMoment.day(startOfDay.day());
  }
}

const perMinute = (perHour) => {
  return perHour / 60;
};

const roundToNearestHour = (durationsArray) => {
  const totalDuration = durationsArray.reduce((total, duration) => total + duration, 0);
  if(totalDuration % 60 !== 0) {
    
    const closestIndex = closestToFullHour(durationsArray);
  
    durationsArray[closestIndex] = (60 - (totalDuration % 60) + durationsArray[closestIndex]);
  }
  return durationsArray;
};

function closestToFullHour(argArray){
  const arrCopy = [...argArray];
  let closestIndex = 0;
  
  for(let i = 0; i < arrCopy.length; i++) {
    arrCopy[i] = arrCopy[i] % 60;
    if(arrCopy[i] >= arrCopy[closestIndex] && arrCopy[i] < 60) {
      closestIndex = i;
    }
  }
  return closestIndex;
}

calculatePay = (family, start, end) => {
  let startOfShift = moment(start, 'HH:mm');
  startOfShift = checkForNextDay(start);

  let endOfShift = moment(end, 'HH:mm');
  endOfShift = checkForNextDay(end);

  let familyShifts = new Array(family.shifts.length);
  for(let i = 0; i < family.shifts.length; i++){
    familyShifts[i] = moment(family.shifts[i].end, 'HH:mm');
    familyShifts[i] = checkForNextDay(familyShifts[i]);
  };

  for(let i = 0; i < familyShifts.length; i++) {
    if(endOfShift.isSameOrBefore(familyShifts[i])) {
      familyShifts[i] = endOfShift;
    }
    if(startOfShift.isSameOrAfter(familyShifts[i])) {
      familyShifts[i] = startOfShift;
    }
  };

  let durations = new Array(familyShifts.length);
  for (let i = 0; i < familyShifts.length; i++) {
    if(i === 0) {
      durations[i] = Math.ceil(moment.duration(familyShifts[i].diff(startOfShift)).asMinutes());
    } else {
      durations[i] = Math.ceil(moment.duration(familyShifts[i].diff(familyShifts[i - 1])).asMinutes());
    }
  }

  const noPartialHourTotal = roundToNearestHour(durations);
  
  let expectedPay = 0;
  for (let i = 0; i < durations.length; i++) {
    expectedPay += (perMinute(family.shifts[i].pay) * noPartialHourTotal[i]); 
  }
  expectedPay = Number.parseFloat(expectedPay).toFixed(2); 
  
  console.log('You are expected to make $', expectedPay);
}

const argv = yargs
  .option('family', {
    alias: 'f',
    description: 'The selected family',
    choices: ['A', 'a', 'B', 'b', 'C', 'c'],
    type: 'character',
  })
  .option('start', {
    alias: 's',
    description: 'The beginning of your shift. e.g. "7:15pm"',
    type: 'string'
  })
  .option('end', {
    alias: 'e',
    description: 'The end of your shift. e.g. "23:00"',
    type: 'string'
  })
  .help()
  .alias('help', 'h')
  .argv;

const parseTime = (arg) => {
  const pattern = /^(\d{1,2}):(\d{2})(am|AM|pm|PM)?$/gm;
  const timeMatch = pattern.exec(arg);
  if(timeMatch == null) {
    return false;
  }
  let hour = parseInt(timeMatch[1]);
  const minute = parseInt(timeMatch[2]);
  const sign = timeMatch[3];
  if(sign && sign.toLowerCase() == 'pm') {
    hour += 12;
  }
  return moment({hour, minute})
}

console.log('\n');

if(argv.family && argv.start && argv.end) {
  const family = FAMILIES.filter(family => family.shortened === argv.family.toLowerCase())[0];
  const start = parseTime(argv.start);
  const end = parseTime(argv.end);
  calculatePay(family, start, end);
} else {
  console.log('For help getting started, type node client.js -h');
}