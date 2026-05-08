import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import LoginScreen from './LoginScreen';
import { UserProvider } from '../context/UserContext';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

function renderLogin() {
  return render(
    <UserProvider>
      <LoginScreen />
    </UserProvider>,
  );
}

describe('LoginScreen', () => {
  it('renders login fields and submit button', () => {
    const { getByTestId } = renderLogin();
    expect(getByTestId('input-username')).toBeTruthy();
    expect(getByTestId('input-password')).toBeTruthy();
    expect(getByTestId('auth-submit')).toBeTruthy();
  });

  it('shows error for wrong credentials', async () => {
    const { getByTestId } = renderLogin();
    fireEvent.changeText(getByTestId('input-username'), 'nobody');
    fireEvent.changeText(getByTestId('input-password'), 'wrong');
    await act(async () => { fireEvent.press(getByTestId('auth-submit')); });
    await waitFor(() => expect(getByTestId('auth-error')).toBeTruthy());
  });

  it('toggles to register mode', () => {
    const { getByTestId, queryByTestId } = renderLogin();
    expect(queryByTestId('input-confirm-password')).toBeNull();
    fireEvent.press(getByTestId('auth-toggle'));
    expect(getByTestId('input-confirm-password')).toBeTruthy();
  });

  it('shows mismatch error when passwords differ in register mode', async () => {
    const { getByTestId } = renderLogin();
    fireEvent.press(getByTestId('auth-toggle')); // switch to register
    fireEvent.changeText(getByTestId('input-username'), 'alice');
    fireEvent.changeText(getByTestId('input-password'), 'pass1');
    fireEvent.changeText(getByTestId('input-confirm-password'), 'pass2');
    await act(async () => { fireEvent.press(getByTestId('auth-submit')); });
    await waitFor(() => expect(getByTestId('auth-error')).toBeTruthy());
  });

  it('registers successfully with matching passwords', async () => {
    const { getByTestId, queryByTestId } = renderLogin();
    fireEvent.press(getByTestId('auth-toggle')); // switch to register
    fireEvent.changeText(getByTestId('input-username'), 'newuser');
    fireEvent.changeText(getByTestId('input-password'), 'pass');
    fireEvent.changeText(getByTestId('input-confirm-password'), 'pass');
    await act(async () => { fireEvent.press(getByTestId('auth-submit')); });
    // After successful register, UserContext sets currentUser; no error shown
    await waitFor(() => expect(queryByTestId('auth-error')).toBeNull());
  });
});
