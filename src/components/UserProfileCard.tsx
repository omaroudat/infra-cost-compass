
import React, { useState } from 'react';
import { useAuth } from '@/context/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Settings, LogOut } from 'lucide-react';

const UserProfileCard: React.FC = () => {
  const { profile, signOut, updateProfile } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    department: profile?.department || ''
  });

  const handleSaveProfile = async () => {
    await updateProfile(editData);
    setIsEditDialogOpen(false);
  };

  if (!profile) return null;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">{profile.full_name}</CardTitle>
            <CardDescription>@{profile.username}</CardDescription>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>Update your profile information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={editData.full_name}
                    onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={editData.department}
                    onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Role:</span>
            <Badge className={getRoleBadgeColor(profile.role)}>
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </Badge>
          </div>
          {profile.department && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Department:</span>
              <span className="text-sm">{profile.department}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Email:</span>
            <span className="text-sm">{profile.email}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;
