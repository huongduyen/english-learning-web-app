import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuthStore } from '../store/useAuthStore';
import * as apiClientModule from '../lib/api-client';

describe('Frontend Authentication Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  describe('LoginPage Form Component', () => {
    it('renders login form with all inputs and action buttons', () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>,
      );

      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /fill demo learner credentials/i }),
      ).toBeInTheDocument();
    });

    it('validates required fields on empty submit', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>,
      );

      const submitButton = screen.getByRole('button', {
        name: /^sign in$/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('populates demo credentials when clicking demo button', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>,
      );

      const demoBtn = screen.getByRole('button', {
        name: /fill demo learner credentials/i,
      });
      await user.click(demoBtn);

      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;

      expect(emailInput.value).toBe('learner@example.com');
      expect(passwordInput.value).toBe('Learner123!');
    });

    it('displays error alert when login error is present in auth store', () => {
      useAuthStore.setState({ error: 'Invalid email or password' });

      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>,
      );

      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  describe('useAuthStore State Management', () => {
    it('updates authentication state and stores tokens upon successful login', async () => {
      const mockAuthResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'user-1',
          email: 'learner@example.com',
          name: 'Demo Learner',
          role: 'LEARNER',
          level: 'BEGINNER',
        },
      };

      vi.spyOn(apiClientModule.apiClient, 'post').mockResolvedValueOnce(mockAuthResponse);

      await useAuthStore.getState().login({
        email: 'learner@example.com',
        password: 'Password123!',
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.accessToken).toBe('mock-access-token');
      expect(state.user?.email).toBe('learner@example.com');
      expect(state.error).toBeNull();
    });

    it('clears authentication state upon logout', async () => {
      useAuthStore.setState({
        accessToken: 'active-token',
        isAuthenticated: true,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test',
          role: 'LEARNER',
          level: 'BEGINNER',
        },
      });

      vi.spyOn(apiClientModule.apiClient, 'post').mockResolvedValueOnce({
        success: true,
      });

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
    });
  });

  describe('ProtectedRoute Component', () => {
    it('redirects unauthenticated users to /login', () => {
      useAuthStore.setState({ isAuthenticated: false, isLoading: false });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<div>Login Page Mock</div>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Secret Dashboard Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.queryByText(/secret dashboard content/i)).not.toBeInTheDocument();
      expect(screen.getByText(/login page mock/i)).toBeInTheDocument();
    });

    it('allows authenticated users to view protected content', () => {
      useAuthStore.setState({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test',
          role: 'LEARNER',
          level: 'BEGINNER',
        },
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Secret Dashboard Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText(/secret dashboard content/i)).toBeInTheDocument();
    });
  });
});
