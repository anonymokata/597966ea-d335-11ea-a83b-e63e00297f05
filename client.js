const yargs = require('yargs');
const moment = require('moment');
const { FAMILIES, startOfDay, endOfDay } = require('./config');

/* 
  @desc: Converts per hour pay into per minute pay
  @args: perHour (float))
  @return: result (float)
*/
const perMinute = (perHour) => {
  let result = perHour / 60;
  if(Number.isNaN(result)) return null; 
  return result;
};

/*
  @desc: confirms arg is a time
  @args: time (str), either signed or military
  @return: time (moment)
*/
const parseTime = (time) => {
  const pattern = /^(\d{1,2}):(\d{2})(am|AM|pm|PM)?$/gm;
  const timeMatch = pattern.exec(time);
  if(timeMatch == null) return null;

  let hour = parseInt(timeMatch[1]);
  const minute = parseInt(timeMatch[2]);
  const sign = timeMatch[3];
  if(sign && sign.toLowerCase() == 'pm') {
    hour += 12;
  }
  time = moment().set('hour', hour).set('minute', minute).millisecond(0).second(0);
  return time;
}

/*
  @desc: helps maintain hours/days in moment() times. If an hour is < 12 military, then it is the next day as it is early morning.
  @arg: argMoment (moment)
  @returns: argMoment (moment)
*/
const checkForNextDay = (argMoment) => {
  if (argMoment.hour() < 12) {
    argMoment.add(1, 'day');
  }
  return argMoment;
}

/*
  @desc: finds index in array of duration that is closest to a full hour
  @arg: arrDurations (array of durations)
  @return: closetIndex (int)
*/
function findClosestShiftToFullHour(arrDurations){
  const arrCopy = [...arrDurations];
  const totalDuration = arrCopy.reduce((total, duration) => total + duration, 0);
  if(totalDuration % 60 === 0) return null;
  
  let closestIndex = 0;
  for(let i = 0; i < arrCopy.length; i++) {
    arrCopy[i] = arrCopy[i] % 60;
    if(arrCopy[i] >= arrCopy[closestIndex] && arrCopy[i] < 60) {
      closestIndex = i;
    }
  }
  return closestIndex;
}

/*
  @desc: rounds total duration to nearest full hour based on findClosestShiftToFullHour() index
  @arg: arrDurations (array of durations)
  @return: arrDurations (array of durations)
*/
const roundToNearestHour = (arrDurations) => {
  const totalDuration = arrDurations.reduce((total, duration) => total + duration, 0);
  const closestIndex = findClosestShiftToFullHour(arrDurations);
  if(closestIndex) {
    arrDurations[closestIndex] = (60 - (totalDuration % 60) + arrDurations[closestIndex]);
  }
  return arrDurations;
};


/*
  @desc: calculates pay for babysitter based on family, start time, and end time
  @arg: family (char), start (str), end (str)
  @return: expectedPay (float)
*/
const calculatePay = (argFamily, argStart, argEnd) => {
  if(!argFamily || !argStart || !argEnd) return null; // makes sure all arguments are accounted for

  const family = FAMILIES.filter(family => family.shortened === argFamily.toLowerCase())[0];
  let startOfShift = parseTime(argStart);
  let endOfShift = parseTime(argEnd);

  // confirms validity of arguments
  if(!family) {
    console.error('Please enter a correct family (A, B, or C)');
    return null; 
  }
  if(!startOfShift || !endOfShift) {
    console.error('Please enter a correct time. Can be either militay or signed. example "21:15".');
    return null;
  }

  startOfShift = checkForNextDay(startOfShift);
  endOfShift = checkForNextDay(endOfShift);

  // check time bounadries
  if (startOfShift.isBefore(startOfDay)) {
    console.error('The start of the shift must be no earlier than 5pm.');
    return null;
  }
  if(endOfShift.isAfter(endOfDay)) {
    console.error('The end of the shift must be no later than 4am.');
    return null;
  } 
  if (endOfShift.isBefore(startOfShift)) {
    console.error('The start of the shift must be before the end of the shift.');
    return null;
  }

  // creates array of shifts based on selected family
  let familyShifts = new Array(family.shifts.length);
  for(let i = 0; i < family.shifts.length; i++){
    familyShifts[i] = moment(family.shifts[i].end, 'HH:mm');
    familyShifts[i] = checkForNextDay(familyShifts[i]);
  };

  // reduces shifts array based on actual start and end times
  for(let i = 0; i < familyShifts.length; i++) {
    if(endOfShift.isSameOrBefore(familyShifts[i])) {
      familyShifts[i] = endOfShift;
    }
    if(startOfShift.isSameOrAfter(familyShifts[i])) {
      familyShifts[i] = startOfShift;
    }
  };

  // creates array of duration based on reduced shifts array
  let durations = new Array(familyShifts.length);
  for (let i = 0; i < familyShifts.length; i++) {
    if(i === 0) {
      durations[i] = Math.ceil(moment.duration(familyShifts[i].diff(startOfShift)).asMinutes());
    } else {
      durations[i] = Math.ceil(moment.duration(familyShifts[i].diff(familyShifts[i - 1])).asMinutes());
    }
  }

  // checks for partial hours and adjusts array accordingly 
  durations = roundToNearestHour(durations);
  
  // calculates pay based off of durations array and perMinute rate of those shifts
  let expectedPay = 0;
  for (let i = 0; i < durations.length; i++) {
    let convertedPay = perMinute(family.shifts[i].pay);
    if(convertedPay == null) { return null }
    expectedPay += (convertedPay * durations[i]); 
  }
  expectedPay = Number.parseFloat(expectedPay).toFixed(2); 
  
  return expectedPay;
}

/*
  @desc: command line use for function
  @arg: family -f (char), start -s (str), and end -e (str)
  @return: prints expected pay in terminal
*/
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
  if (pay) console.log('Expected pay: $', pay);
} else {
  console.log('For help getting started, type node client.js -h');
}

// exports for testing purposes only
exports.parseTime = parseTime;
exports.calculatePay = calculatePay;
exports.checkForNextDay = checkForNextDay;
exports.perMinute = perMinute;
exports.roundToNearestHour = roundToNearestHour;
exports.findClosestShiftToFullHour = findClosestShiftToFullHour;