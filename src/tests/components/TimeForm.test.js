import React from 'react';
import { shallow } from 'enzyme';

import TimeForm from '../../components/TimeForm';
import { duration } from 'moment';

test('Should correctly render TimeForm', () => {
  const wrapper = shallow(<TimeForm />);
  expect(wrapper).toMatchSnapshot();
});

test('Should initialize form with start time 5:00pm and end time 04:00am', () => {
  const wrapper = shallow(<TimeForm />);
  expect(wrapper.state('startTime')).toBe('17:00');
  expect(wrapper.state('endTime')).toBe('04:00');
});

test('Should calculate initial duration at 660 minutes based off 5pm to 4am defaults', () => {
  const wrapper = shallow(<TimeForm />);
  expect(wrapper.state('duration')).toBe(660);
});

test('Should update start time correctly to 6pm', () => {
  const wrapper = shallow(<TimeForm />);
  wrapper.find('#startTime').simulate('change', {
    target: {
      value: '18:00'
    }
  });
  expect(wrapper.state('startTime')).toBe('18:00');
});