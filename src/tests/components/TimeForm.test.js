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

test('Should initialize form with startOfShift 5:00pm and endOfShift 04:00am', () => {
  expect(wrapper.state('startOfShift')).toBe('17:00');
  expect(wrapper.state('endOfShift')).toBe('04:00');
});

test('Should update start time correctly to 6pm', () => {
  wrapper.find('#startTime').simulate('change', {
    target: {
      value: '18:00' // 6pm
    }
  });
  expect(wrapper.state('startOfShift')).toBe('18:00');
});

test('Should prevent change to start time based on being too early', () => {
  wrapper.find('#startTime').simulate('change', {
    target: {
      value: '14:00' // 2pm
    }
  });
  expect(wrapper.state('startOfShift')).toBe('17:00');
});

test('Should prevent change to startOfShift based on being after end of day', () => {
  wrapper.find('#startTime').simulate('change', {
    target: {
      value: '05:00' // 5am
    }
  });
  expect(wrapper.state('startOfShift')).toBe('17:00');
});

test('Should update endOfShift correctly', () => {
  wrapper.find('#endTime').simulate('change', {
    target: {
      value: '22:00' // 10pm
    }
  });
  expect(wrapper.state('endOfShift')).toBe('22:00');
});

test('Should prevent endOfShift from changing based on being before start of day', () => {
  wrapper.find('#endTime').simulate('change', {
    target: {
      value: '16:00' // 4pm
    }
  });
  expect(wrapper.state('endOfShift')).toBe('04:00');
});

test('Should prevent endTime from changing based on being after end of day', () => {
  wrapper.find('#endTime').simulate('change', {
    target: {
      value: '05:00' // 5am
    }
  });
  expect(wrapper.state('endOfShift')).toBe('04:00');
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
  expect(wrapper.state('startOfShift')).toBe('17:00');
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
  expect(wrapper.state('endOfShift')).toBe('04:00');
});

test('Should change family name correctly', () => {
  wrapper.find('#family').simulate('change', {
    target: {
      value: 'b'
    }
  });
  expect(wrapper.state('family')['shortened']).toBe('b');
});

test('Should prevent family name returning to default', () => {
  wrapper.find('#family').simulate('change', {
    target: {
      value: 'b'
    }
  });
  wrapper.find('#family').simulate('change', {
    target: {
      value: '-1'
    }
  });
  expect(wrapper.state('family')['shortened']).toBe('b');
});


test('Should call calculatePay on click', () => {
  const calculateSpy = jest.spyOn(wrapper.instance(), 'calculatePay');
  wrapper.find('#family').simulate('change', {
    target: {
      value: 'a'
    }
  });
  wrapper.find("#buttonCalc").simulate('click');
  expect(calculateSpy).toHaveBeenCalled();
});

test('Should prevent calculatePay from being called without selected family', () => {
  const calculateSpy = jest.spyOn(wrapper.instance(), 'calculatePay');
  wrapper.find("#buttonCalc").simulate('click');
  expect(calculateSpy).not.toHaveBeenCalled();
  expect(wrapper.state('expectedPay')).toBe(0);
});

test('Should calculate full shift 5pm to 4am for family A at $190', () => {
  wrapper.find('#family').simulate('change', {
    target: {
      value: 'a'
    }
  });
  wrapper.find("#buttonCalc").simulate('click');
  expect(wrapper.state('expectedPay')).toBe('190.00');
});

test('Should calculate full shift 5pm to 4am for family B at $140', () => {
  wrapper.find('#family').simulate('change', {
    target: {
      value: 'b'
    }
  });
  wrapper.find("#buttonCalc").simulate('click');
  expect(wrapper.state('expectedPay')).toBe('140.00');
});

test('Should calculate full shift 5pm to 4am for family B at $189', () => {
  wrapper.find('#family').simulate('change', {
    target: {
      value: 'c'
    }
  });
  wrapper.find("#buttonCalc").simulate('click');
  expect(wrapper.state('expectedPay')).toBe('189.00');
});

test('Should calculate family A two hours first shift at $30', () => {
  wrapper.setState({
    family: {
      name: 'Addams',
      shortened: 'a',
      shifts: [
        {
          end: 23,
          pay: 15
        },
        {
          end: 4,
          pay: 20
        }
      ]
    },
    endOfShift: 19
  });
  wrapper.find("#buttonCalc").simulate("click");
  expect(wrapper.state('expectedPay')).toEqual('30.00');
});

test('Should calculate family B 4.5hours all three shifts pays with 9:30pm start at $60, also bringing 9:30pm to a full hour', () => {
  wrapper.find('#family').simulate('change', {
    target: {
      value: 'b'
    }
  });
  wrapper.setState({
    startOfShift: '21:30',
    endOfShift: 2
  });
  wrapper.find("#buttonCalc").simulate("click");
  expect(wrapper.state('expectedPay')).toEqual('60.00');
});