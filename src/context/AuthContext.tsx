
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, UserRole, UserManagement } from '../types/auth';
import { toast } from 'sonner';

// Mock users for demo purposes
// In a real app, this would be in a database
const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: '2',
    username: 'dataentry',
    password: 'data123',
    role: 'dataEntry'
  }
];

interface AuthContextType extends AuthState, UserManagement {
  login: (username: string, password: string) => boolean;
  logout: () => void;
  hasPermission: (roles: UserRole[]) => boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        return {
          isAuthenticated: true,
          user: parsedUser
        };
      } catch (e) {
        return initialState;
      }
    }
    return initialState;
  });
  
  const [users, setUsers] = useState<User[]>(() => {
    // Load users from localStorage or use mock users
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      try {
        return JSON.parse(savedUsers);
      } catch (e) {
        return MOCK_USERS;
      }
    }
    return MOCK_USERS;
  });

  // Save auth state to localStorage when it changes
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      localStorage.setItem('user', JSON.stringify(auth.user));
    } else {
      localStorage.removeItem('user');
    }
  }, [auth]);
  
  // Save users to localStorage when they change
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const login = (username: string, password: string): boolean => {
    // Find user with matching credentials
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      setAuth({
        isAuthenticated: true,
        user
      });
      toast.success(`Welcome, ${user.username}!`);
      return true;
    } else {
      toast.error('Invalid credentials');
      return false;
    }
  };

  const logout = () => {
    setAuth({
      isAuthenticated: false,
      user: null
    });
    toast.info('Logged out successfully');
  };

  const hasPermission = (roles: UserRole[]): boolean => {
    if (!auth.isAuthenticated || !auth.user) {
      return false;
    }
    return roles.includes(auth.user.role);
  };
  
  const addUser = (username: string, password: string, role: UserRole): boolean => {
    // Check if username already exists
    if (users.some(u => u.username === username)) {
      toast.error('Username already exists');
      return false;
    }
    
    const newUser: User = {
      id: `${users.length + 1}`,
      username,
      password,
      role
    };
    
    setUsers(prevUsers => [...prevUsers, newUser]);
    toast.success(`User ${username} added successfully`);
    return true;
  };
  
  const getAllUsers = (): User[] => {
    return users;
  };

  return (
    <AuthContext.Provider value={{ 
      ...auth, 
      login, 
      logout, 
      hasPermission, 
      addUser, 
      getAllUsers 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
