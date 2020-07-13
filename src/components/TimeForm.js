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

export default class TimeForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startTime: startOfDay.format('HH:mm'), // default to minimum babysit time
      endTime: endOfDay.format('HH:mm'), // default to 5 hours later
      duration: null
    }
  }
  handleStartChange = (e) => {
    const startTimeValue = e.target.value;
    const startTimeMoment = moment(startTimeValue, 'HH:mm');
    const endTimeMoment = moment(this.state.endTime, 'HH:mm');
    if(endTimeMoment.hour() < 12) {
      endTimeMoment.add(24, 'hours');
    }
    if(startTimeMoment.isBefore(startOfDay) ||
    startTimeMoment.isSameOrAfter(endTimeMoment) ||
    startTimeMoment.isAfter(endOfDay)
    )
    {
      // do nothing
    } else {
      this.setState({
        startTime: startTimeMoment.format('HH:mm')
      });
    }
  }
  handleEndChange = (e) => {
    const endTimeValue = e.target.value;
    let endTimeMoment = moment(endTimeValue, 'HH:mm');
    endTimeMoment = this.checkForNextDay(endTimeMoment);
    const startTimeMoment = moment(this.state.startTime, 'HH:mm');
    
    if (endTimeMoment.isBefore(startOfDay) ||
    endTimeMoment.isSameOrBefore(startTimeMoment) ||
    endTimeMoment.isAfter(endOfDay)
    ) {
      // do nothing
    } else {
      this.setState({
        endTime: endTimeMoment.format('HH:mm')
      });
    }
  }
  
  handleFamilyChange = (e) => {
    const familyName = e.target.value;
    if(familyName != -1) {
      this.setState({
        familyName
      });
    }
  }

  calculateDuration = () => {
    const startTimeMoment = moment(this.state.startTime, 'HH:mm');
    let endTimeMoment = moment(this.state.endTime, 'HH:mm');
    endTimeMoment = this.checkForNextDay(endTimeMoment);
    const duration = moment.duration(endTimeMoment.diff(startTimeMoment)).asMinutes();
    this.setState({
      duration
    })
  }
  componentWillMount = () => {
    this.calculateDuration();
  }
  
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
              step: 300, // 5 min
            }}
            onChange={this.handleStartChange}
            value={this.state.startTime}
            inputProps = {
              {
                step: 900, // 5 min
              }
            }
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
              step: 900, // 5 min
            }}
            onChange={this.handleEndChange}
            value={this.state.endTime}
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
            <option value="a">Addams</option>
            <option value="b">Bennett</option>
            <option value="c">Church</option>
          </select>
        </form>
        <br/>
        <button
          onClick={this.calculateDuration}
          disabled={!this.state.familyName}
        >
          Update time:
        </button>
        <p>{this.state.duration}</p>
        {this.state.familyName && (<div>
            Family Time Cutoffs for family {this.state.familyName}
            <ul>
              {this.state.familyName == 'a' && (<li>Pays $15 per hour before 11pm, and $20 per hour the rest of the night</li>)}
              {this.state.familyName == 'b' && (<li>Pays $12 per hour before 10pm, $8 between 10 and 12, and $16 the rest of the night</li>)}
              {this.state.familyName == 'c' && (<li>Pays $21 per hour before 9pm, then $15 the rest of the night</li>)}
            </ul>
        </div>)}

      </div>
    )
  }
};