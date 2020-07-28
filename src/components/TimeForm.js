import React from 'react';
import moment, { duration } from 'moment';

import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
}));

const startOfDay = moment({
  'hour': 17
});

const endOfDay = moment(startOfDay).add(11, 'hours');

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

// Hardcoded for this exercise
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

const getFamilyName = () => {
  return FAMILIES.filter(family => family.shortened == this.state.family.shortened).name;
}

export default class TimeForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startOfShift: startOfDay.format('HH:mm'), // default to minimum babysit time
      endOfShift: endOfDay.format('HH:mm'), // default to maximum babysit time
      expectedPay: 0,
      family: null
    }
  }

  handleStartChange = (e) => {
    const startTimeValue = e.target.value;
    let startOfShift = moment(startTimeValue, 'HH:mm');
    startOfShift = this.checkForNextDay(startOfShift);

    let endOfShift = moment(this.state.endOfShift, 'HH:mm');
    endOfShift = this.checkForNextDay(endOfShift);

    const hasTimeFormatErrors = startOfShift.isBefore(startOfDay) ||
                                startOfShift.isSameOrAfter(endOfShift) ||
                                startOfShift.isAfter(endOfDay);
    if(!hasTimeFormatErrors){
      this.setState({
        startOfShift: startOfShift.format('HH:mm')
      });
    }
  }

  handleEndChange = (e) => {
    const endTimeValue = e.target.value;
    let endOfShift = moment(endTimeValue, 'HH:mm');
    endOfShift = this.checkForNextDay(endOfShift);
    const startOfShift = moment(this.state.startOfShift, 'HH:mm');
    
    const hasTimeFormatErrors = endOfShift.isBefore(startOfDay) ||
                                endOfShift.isSameOrBefore(startOfShift) ||
                                endOfShift.isAfter(endOfDay)
    
    if (!hasTimeFormatErrors) {
      this.setState({
        endOfShift: endOfShift.format('HH:mm')
      });
    }
  }
  
  handleFamilyChange = (e) => {
    const selectedFamily = e.target.value;
    const family = FAMILIES.filter(family => family.shortened === selectedFamily)[0];
    if(selectedFamily != -1) {
      this.setState({
        family
      });
    }
  }

  calculatePay = () => {
    if (this.state.family === null) return false;
    let startOfShift = moment(this.state.startOfShift, 'HH:mm');
    startOfShift = this.checkForNextDay(startOfShift);

    let endOfShift = moment(this.state.endOfShift, 'HH:mm');
    endOfShift = this.checkForNextDay(endOfShift);

    let familyShifts = new Array(this.state.family.shifts.length);
    for(let i = 0; i < this.state.family.shifts.length; i++){
      familyShifts[i] = moment(this.state.family.shifts[i].end, 'HH:mm');
      familyShifts[i] = this.checkForNextDay(familyShifts[i]);
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
      expectedPay += (perMinute(this.state.family.shifts[i].pay) * noPartialHourTotal[i]); 
    }
    expectedPay = Number.parseFloat(expectedPay).toFixed(2); 
    
    this.setState({
      expectedPay
    });
  }
  
  // Helper function to confirm that AM/post midnight shifts are calculated on day + 1.
  checkForNextDay = (argMoment) => {
    if (argMoment.hour() < 12) {
      return argMoment.day(startOfDay.day()).add(1, 'day');
    } else {
      return argMoment.day(startOfDay.day());
    }
  }

  formatTime = (hour) => {
    let AMorPM = hour >= 5 ? 'pm' : 'am';
    hour = hour >= 13 ? hour - 12 : hour;
    hour = hour == 0 ? hour + 12 : hour;
    return hour + AMorPM;
  }

  render() {
    return(
      <div>
        <form noValidate>
          <TextField
            id="startTime"
            label="Start Time"
            type="time"
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300
            }}
            onChange={this.handleStartChange}
            value={this.state.startOfShift}
          />
          <br />
          <TextField
            id="endTime"
            label="End Time"
            type="time"
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300
            }}
            onChange={this.handleEndChange}
            value={this.state.endOfShift}
          />
          <br />
          <br />
          <label htmlFor="family">Which family: </label>
          <select
            name="family"
            value={this.state.familyName}
            onChange={this.handleFamilyChange}
            id="family"
          >
            <option value="-1">---</option>
            {
              FAMILIES.map(family => (
                <option value={family.shortened} key={family.shortened}>{family.name}</option>
              ))
            }
          </select>
        </form>
        <br/>
        <button
          onClick={this.calculatePay}
          disabled={!this.state.family}
          id="buttonCalc"
        >
          Calculate pay:
        </button>
        <p>${this.state.expectedPay}</p>
        {this.state.family && (<div>
            Family Time Cutoffs for family {this.state.family.name}
            <ul>
              <li>Pays {this.state.family.shifts.map((shift,index) => (
                <span key={index}>${shift.pay} until {this.formatTime(shift.end)}{index !== this.state.family.shifts.length - 1 && <span>, </span>}</span>
              ))}</li>
            </ul>
        </div>)}

      </div>
    )
  }
};