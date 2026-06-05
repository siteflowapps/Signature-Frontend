// Login.test.tsx - Test Suite

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from './login/LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

// Basic wrapper to provide required contexts and routing
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {ui}
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  it('renders Phone Number input correctly', () => {
    renderWithProviders(<Login />);
    
    // Title checks
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    
    // Elements
    const phoneInput = screen.getByPlaceholderText('98765 43210');
    expect(phoneInput).toBeInTheDocument();
    
    const submitBtn = screen.getByRole('button', { name: /Get Verification Code/i });
    expect(submitBtn).toBeInTheDocument();
  });

  it('allows user to type 10 digit phone number', () => {
    renderWithProviders(<Login />);
    const phoneInput = screen.getByPlaceholderText('98765 43210') as HTMLInputElement;
    
    fireEvent.change(phoneInput, { target: { value: '9999999999' } });
    expect(phoneInput.value).toBe('99999 99999'); // Formatted string checks from Login.tsx
  });
});
