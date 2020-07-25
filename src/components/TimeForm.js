import React from 'react';
import moment from 'moment';

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

const roundToFullHour = (firstShift, secondShift, thirdShift) => {
  let times = [firstShift, secondShift, thirdShift];
  let closestTime = 0;
  
  if((secondShift % 60) > times[closestTime] % 60) {
    closestTime = 1;
  }
  if((thirdShift % 60) > times[closestTime] % 60) {
    closestTime = 2;
  }

  if((times[closestTime] % 60 !== 0) && ((firstShift + secondShift + thirdShift) % 60 !== 0)) {
    times[closestTime] = (60 - ((firstShift + secondShift + thirdShift) % 60)) + times[closestTime];
  }
  return times;
};

const FAMILIES = [
  {
    name: 'Addams',
    shortened: 'a',
    firstShift: {
      end: 23,
      pay: 15
    },
    secondShift: {
      end: 4,
      pay: 20
    }
  },
  {
    name: 'Bennett',
    shortened: 'b',
    firstShift: {
      end: 22,
      pay: 12
    },
    secondShift: {
      end: 0,
      pay: 8
    },
    thirdShift: {
      end: 4,
      pay: 16
    }
  },
  {
    name: 'Church',
    shortened: 'c',
    firstShift: {
      end: 21,
      pay: 21,
    },
    secondShift: {
      end: 4,
      pay: 15
    }
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
      family: {
        name: null,
          firstShift: {
            end: null,
            pay: null
          },
          secondShift: {
            end: null,
            pay: null
          },
          thirdShift: {
            end: null,
            pay: null
          }
        }
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
    
    if (endOfShift.isBefore(startOfDay) ||
    endOfShift.isSameOrBefore(startOfShift) ||
    endOfShift.isAfter(endOfDay)
    ) {
      // do nothing
    } else {
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
    let startOfShift = moment(this.state.startOfShift, 'HH:mm');
    startOfShift = this.checkForNextDay(startOfShift);

    let endOfShift = moment(this.state.endOfShift, 'HH:mm');
    endOfShift = this.checkForNextDay(endOfShift);

    let firstShiftEnd = moment(this.state.family.firstShift.end, 'HH:mm');
    firstShiftEnd = this.checkForNextDay(firstShiftEnd);

    let secondShiftEnd = moment(this.state.family.secondShift.end, 'HH:mm');
    secondShiftEnd = this.checkForNextDay(secondShiftEnd);

    let thirdShiftEnd = null;
    if(this.state.family.thirdShift) {
      thirdShiftEnd = moment(this.state.family.thirdShift.end, 'HH:mm');
      thirdShiftEnd = this.checkForNextDay(thirdShiftEnd);
    }

    if(endOfShift.isSameOrBefore(firstShiftEnd)) {
      firstShiftEnd = endOfShift;
    }

    if(endOfShift.isSameOrBefore(secondShiftEnd)) {
      secondShiftEnd = endOfShift;
    }

    if(thirdShiftEnd && endOfShift.isSameOrBefore(thirdShiftEnd)) {
      thirdShiftEnd = endOfShift;
    }

    if(startOfShift.isSameOrAfter(firstShiftEnd)) {
      firstShiftEnd = startOfShift;
    }

    if(startOfShift.isSameOrAfter(secondShiftEnd)) {
      secondShiftEnd = startOfShift;
    }

    let firstShiftDuration = Math.ceil(moment.duration(firstShiftEnd.diff(startOfShift)).asMinutes());
    let secondShiftDuration = Math.ceil(moment.duration(secondShiftEnd.diff(firstShiftEnd)).asMinutes());
    let thirdShiftDuration = 0;
    if(thirdShiftEnd) {
      thirdShiftDuration = Math.ceil(moment.duration(thirdShiftEnd.diff(secondShiftEnd)).asMinutes());
    }

    const noPartialHours = roundToFullHour(firstShiftDuration, secondShiftDuration, thirdShiftDuration);
    const firstShiftPay = this.state.family.firstShift.pay;
    const secondShiftPay = this.state.family.secondShift.pay;
    let thirdShiftPay = 0;
    if(this.state.family.thirdShift) {
      thirdShiftPay = this.state.family.thirdShift.pay;
    }
    this.setState({
      expectedPay: 
        ((perMinute(firstShiftPay) * noPartialHours[0]) + 
        (perMinute(secondShiftPay) * noPartialHours[1]) + 
        (perMinute(thirdShiftPay) * noPartialHours[2])).toFixed(2)
    })
  }
  
  // Helper function to confirm that AM/post midnight shifts are calculated on day + 1.
  checkForNextDay = (argMoment) => {
    if (argMoment.hour() < 12) {
      return argMoment.day(startOfDay.day()).add(1, 'day');
    } else {
      return argMoment.day(startOfDay.day());
    }
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
                <option value={family.shortened}>{family.name}</option>
              ))
            }
          </select>
        </form>
        <br/>
        <button
          onClick={this.calculatePay}
          disabled={!this.state.family.name}
          id="buttonCalc"
        >
          Calculate pay:
        </button>
        <p>${this.state.expectedPay}</p>
        {this.state.family.name && (<div>
            Family Time Cutoffs for family {this.getFamilyName}
            <ul>
              <li>Pays
                ${this.state.family.firstShift.pay} before {this.state.family.firstShift.end}pm and 
                ${this.state.family.secondShift.pay} before {this.state.family.secondShift.end} {this.state.family.thirdShift && (<span>and 
                ${this.state.family.thirdShift.pay} before {this.state.family.thirdShift.end}</span>)
              }
              </li>
            </ul>
        </div>)}

      </div>
    )
  }
};