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
})

const endOfDay = moment(startOfDay).add(11, 'hours');

export default class TimeForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startTime: startOfDay.format('HH:mm'), // default to minimum babysit time
      endTime: endOfDay.format('HH:mm'), // default to 5 hours later
      duration: 5
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

  calculateDuration = () => {
    const startTimeMoment = moment(this.state.startTime, 'HH:mm');
    let endTimeMoment = moment(this.state.endTime, 'HH:mm');
    endTimeMoment = this.checkForNextDay(endTimeMoment);
    const duration = moment.duration(endTimeMoment.diff(startTimeMoment)).asMinutes();
    this.setState({
      duration
    })
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
              step: 300, // 5 min
            }}
            onChange={this.handleEndChange}
            value={this.state.endTime}
          />
        </form>
        <button
          onClick={this.calculateDuration}
        >Update time:</button><p>{this.state.duration}</p>
      </div>
    )
  }
};