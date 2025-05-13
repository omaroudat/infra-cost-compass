
export type UserRole = 'admin' | 'dataEntry';

export interface User {
  id: string;
  username: string;
  password: string; // Note: In a real app, passwords should be hashed and never stored in client
  role: UserRole;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface UserManagement {
  addUser: (username: string, password: string, role: UserRole) => boolean;
  getAllUsers: () => User[];
}
