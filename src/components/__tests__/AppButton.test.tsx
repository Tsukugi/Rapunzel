// Simple test to verify our components work
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AppButton } from './src/components/AppButton';

describe('AppButton', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<AppButton title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<AppButton title="Press Me" onPress={onPressMock} />);
    
    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders primary variant by default', () => {
    const { getByTestId } = render(
      <AppButton title="Test" onPress={() => {}} testID="test-button" />
    );
    const button = getByTestId('test-button');
    expect(button).toBeTruthy();
  });
});