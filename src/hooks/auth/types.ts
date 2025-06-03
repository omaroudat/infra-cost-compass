
import { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'editor' | 'viewer';
  department?: string;
  password?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface AuthActions {
  signUp: (username: string, password: string, fullName?: string) => Promise<any>;
  signIn: (username: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  canEdit: () => boolean;
  canDelete: () => boolean;
  isAdmin: () => boolean;
}
