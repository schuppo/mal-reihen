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
    expect(getByTestId('auth-submit')).toBeTruthy();
  });

  it('shows error for unknown username', async () => {
    const { getByTestId } = renderLogin();
    fireEvent.changeText(getByTestId('input-username'), 'nobody');
    await act(async () => { fireEvent.press(getByTestId('auth-submit')); });
    await waitFor(() => expect(getByTestId('auth-error')).toBeTruthy());
  });

  it('toggles to register mode', () => {
    const { getByTestId, queryByTestId } = renderLogin();
    expect(queryByTestId('auth-toggle')).toBeTruthy();
    fireEvent.press(getByTestId('auth-toggle'));
    // No confirm-password field in password-free mode
    expect(queryByTestId('input-confirm-password')).toBeNull();
  });

  it('registers successfully with just a username', async () => {
    const { getByTestId, queryByTestId } = renderLogin();
    fireEvent.press(getByTestId('auth-toggle')); // switch to register
    fireEvent.changeText(getByTestId('input-username'), 'newuser');
    await act(async () => { fireEvent.press(getByTestId('auth-submit')); });
    // After successful register, UserContext sets currentUser; no error shown
    await waitFor(() => expect(queryByTestId('auth-error')).toBeNull());
  });
});
