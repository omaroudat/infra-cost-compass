
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { validateForm, sanitizeInput } from '@/utils/validation';
import ValidationErrorDisplay from '@/components/ValidationErrorDisplay';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateSignInForm = () => {
    const errors = validateForm([
      {
        field: 'email',
        value: email,
        rules: [
          { type: 'required', message: 'Email is required' }
        ]
      },
      {
        field: 'password',
        value: password,
        rules: [
          { type: 'required', message: 'Password is required' }
        ]
      }
    ]);
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignInForm()) return;
    
    setIsLoading(true);
    setValidationErrors([]);
    
    const result = await signIn(email, password);
    if (result.data && !result.error) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[450px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">ConstructFin</CardTitle>
          <CardDescription>Construction Financial Management System</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSignIn}>
          <CardContent className="space-y-4">
            <ValidationErrorDisplay errors={validationErrors} />
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input 
                  id="email"
                  type="email" 
                  placeholder="Enter your email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="pl-10"
                  required
                />
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="pl-10"
                  required
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <button 
                  type="button"
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </CardFooter>
        </form>
        
        <div className="p-4 text-center">
          <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
            <div className="font-medium mb-1">Default Admin Credentials:</div>
            <div>Email: admin@constructfin.local</div>
            <div>Password: Admin123</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
