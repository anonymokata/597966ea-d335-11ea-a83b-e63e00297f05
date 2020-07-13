import React from 'react';
import { shallow } from 'enzyme';

import TimeForm from '../../components/TimeForm';
import { duration } from 'moment';

let wrapper;
beforeEach(() => {
  wrapper = shallow(<TimeForm />);
});

test('Should correctly render TimeForm', () => {
  expect(wrapper).toMatchSnapshot();
});

test('Should initialize form with start time 5:00pm and end time 04:00am', () => {
  expect(wrapper.state('startTime')).toBe('17:00');
  expect(wrapper.state('endTime')).toBe('04:00');
});

test('Should calculate initial duration at 660 minutes based off 5pm to 4am defaults', () => {
  expect(wrapper.state('duration')).toBe(660);
});

test('Should update start time correctly to 6pm', () => {
  wrapper.find('#startTime').simulate('change', {
    target: {
      value: '18:00' // 6pm
    }
  });
  expect(wrapper.state('startTime')).toBe('18:00');
});

test('Should prevent change to start time based on being too early', () => {
  wrapper.find('#startTime').simulate('change', {
    target: {
      value: '14:00' // 2pm
    }
  });
  expect(wrapper.state('startTime')).toBe('17:00');
});

test('Should prevent change to start time based on being after end of day', () => {
  wrapper.find('#startTime').simulate('change', {
    target: {
      value: '05:00' // 5am
    }
  });
  expect(wrapper.state('startTime')).toBe('17:00');
});

test('Should update endTime correctly', () => {
  wrapper.find('#endTime').simulate('change', {
    target: {
      value: '22:00' // 10pm
    }
  });
  expect(wrapper.state('endTime')).toBe('22:00');
});

test('Should prevent endTime from changing based on being before start of day', () => {
  wrapper.find('#endTime').simulate('change', {
    target: {
      value: '16:00' // 4pm
    }
  });
  expect(wrapper.state('endTime')).toBe('04:00');
});

test('Should prevent endTime from changing based on being after end of day', () => {
  wrapper.find('#endTime').simulate('change', {
    target: {
      value: '05:00' // 5am
    }
  });
  expect(wrapper.state('endTime')).toBe('04:00');
});

test('Should prevent start time from being later than end time', () => {
  wrapper.find('#endTime').simulate('change', {
    target: {
      value: '22:00' // 10pm
    }
  });
  
  wrapper.find('#startTime').simulate('change', {
    target: {
      value: '23:00' // 11pm
    }
  });
  expect(wrapper.state('startTime')).toBe('17:00');
});

test('Should prevent end time from being earlier than start time', () => {
  wrapper.find('#startTime').simulate('change', {
    target: {
      value: '19:00' // 7pm
    }
  });

  wrapper.find('#endTime').simulate('change', {
    target: {
      value: '18:00' // 6pm
    }
  });
  expect(wrapper.state('endTime')).toBe('04:00');
});

test('Should change family name correctly', () => {
  wrapper.find('#family').simulate('change', {
    target: {
      value: 'b'
    }
  });
  expect(wrapper.state('familyName')).toBe('b');
});