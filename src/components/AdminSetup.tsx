
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

const AdminSetup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetupAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      // Since signUp is not available, show a message that admin setup is not implemented
      toast.info('Admin setup functionality is not available. Please contact system administrator.');
    } catch (error: any) {
      toast.error('Failed to create admin account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[450px]">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Initial Setup</CardTitle>
          <CardDescription>
            Create the first admin account for your ConstructFin system
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSetupAdmin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName"
                type="text" 
                placeholder="Enter admin full name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email" 
                placeholder="Enter admin email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                type="password" 
                placeholder="Create a secure password (min 6 characters)" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                minLength={6}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Admin Account...' : 'Setup Admin Account'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default AdminSetup;
