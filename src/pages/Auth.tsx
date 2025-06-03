
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Lock, User, Mail } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await signIn(email, password);
    if (result.data && !result.error) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await signUp(email, password, username, fullName);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[450px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">ConstructFin</CardTitle>
          <CardDescription>Construction Financial Management System</CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mx-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Input 
                      id="signin-email"
                      type="email" 
                      placeholder="Enter your email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="pl-10"
                      required
                    />
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="signin-password"
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
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Input 
                      id="signup-email"
                      type="email" 
                      placeholder="Enter your email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="pl-10"
                      required
                    />
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-fullname">Full Name</Label>
                  <div className="relative">
                    <Input 
                      id="signup-fullname"
                      type="text" 
                      placeholder="Enter your full name" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)} 
                      className="pl-10"
                    />
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <div className="relative">
                    <Input 
                      id="signup-username"
                      type="text" 
                      placeholder="Choose a username" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      className="pl-10"
                    />
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="signup-password"
                      type={showPassword ? "text" : "password"} 
                      placeholder="Create a password" 
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
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
