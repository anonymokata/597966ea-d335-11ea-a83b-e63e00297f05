const yargs = require('yargs');
const moment = require('moment');
const { FAMILIES, startOfDay, endOfDay } = require('./config');

const checkForNextDay = (argMoment) => {
  if (argMoment.hour() < 12) {
    return argMoment.day(startOfDay.day()).add(1, 'day');
  } else {
    return argMoment.day(startOfDay.day());
  }
}

const perMinute = (perHour) => {
  let result = perHour / 60;
  if(!Number.isNaN(result)) { return result; }
  else { return null }
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

const parseTime = (arg) => {
  const pattern = /^(\d{1,2}):(\d{2})(am|AM|pm|PM)?$/gm;
  const timeMatch = pattern.exec(arg);
  if(timeMatch == null) return null;

  let hour = parseInt(timeMatch[1]);
  const minute = parseInt(timeMatch[2]);
  const sign = timeMatch[3];
  if(sign && sign.toLowerCase() == 'pm') {
    hour += 12;
  }
  return moment().set('hour', hour).set('minute', minute).millisecond(0).second(0);
}

const calculatePay = (argFamily, argStart, argEnd) => {
  if(!argFamily || !argStart || !argEnd) return null;
  const family = FAMILIES.filter(family => family.shortened === argFamily.toLowerCase())[0];
  const start = parseTime(argStart);
  const end = parseTime(argEnd);

  if(!family || !start || !end) return null; // confirm valid arguments

  let startOfShift = moment(start, 'HH:mm');
  startOfShift = checkForNextDay(start);
  let endOfShift = moment(end, 'HH:mm');
  endOfShift = checkForNextDay(end);

  if (startOfShift.isBefore(startOfDay) || endOfShift.isAfter(endOfDay) || endOfShift.isBefore(startOfShift)) return null; // check time bounadries

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
    let convertedPay = perMinute(family.shifts[i].pay);
    if(convertedPay == null) { return null }
    expectedPay += (convertedPay * noPartialHourTotal[i]); 
  }
  expectedPay = Number.parseFloat(expectedPay).toFixed(2); 
  
  return expectedPay;
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

if(argv.family && argv.start && argv.end) {
  const pay = calculatePay(argv.family, argv.start, argv.end);
  console.log('Expected pay: $', pay);
} else {
  console.log('For help getting started, type node client.js -h');
}

exports.parseTime = parseTime;
exports.calculatePay = calculatePay;
exports.checkForNextDay = checkForNextDay;
exports.perMinute = perMinute;