import { User, SignInCredentials, SignUpCredentials } from '../types';

const SESSION_KEY = 'visiondesk_session';

export const authService = {
  signUp: async (credentials: SignUpCredentials): Promise<User> => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      let errorMessage = 'Sign up failed';
      try {
        const data = await response.json();
        errorMessage = data.error || errorMessage;
      } catch (e) {
        errorMessage = `Error ${response.status}: ${response.statusText || 'Unknown error'}`;
      }
      throw new Error(errorMessage);
    }

    try {
      const user = await response.json();
      authService.setSession(user);
      return user;
    } catch (e) {
      throw new Error('Server returned an invalid response. Please try again.');
    }
  },

  signIn: async (credentials: SignInCredentials): Promise<User> => {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      let errorMessage = 'Invalid email or password';
      try {
        const data = await response.json();
        errorMessage = data.error || errorMessage;
      } catch (e) {
        errorMessage = `Error ${response.status}: ${response.statusText || 'Unknown error'}`;
      }
      throw new Error(errorMessage);
    }

    try {
      const user = await response.json();
      authService.setSession(user);
      return user;
    } catch (e) {
      throw new Error('Server returned an invalid response. Please try again.');
    }
  },

  signOut: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getSession: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  setSession: (user: User) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
};
