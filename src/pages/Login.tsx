
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">ConstructFin</CardTitle>
          <CardDescription>Construction Financial Manager</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input 
                  id="username"
                  type="text" 
                  placeholder="Enter your username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
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
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Log In</Button>
          </CardFooter>
        </form>
        <div className="p-4 text-center text-sm text-slate-400">
          <div className="mb-2">Demo Credentials:</div>
          <div>Username: admin / Password: admin123</div>
          <div>Username: dataentry / Password: data123</div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
