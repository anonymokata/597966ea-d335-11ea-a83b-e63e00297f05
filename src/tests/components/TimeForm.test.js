import React from 'react';
import { shallow } from 'enzyme';

import TimeForm from '../../components/TimeForm';

test('Should correctly render TimeForm', () => {
  const wrapper = shallow(<TimeForm />);
  expect(wrapper).toMatchSnapshot();
});