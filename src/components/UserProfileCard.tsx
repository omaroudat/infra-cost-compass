
import React, { useState } from 'react';
import { useAuth } from '@/context/ManualAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Mail, Building2, Crown, Shield, Eye, Users, ChevronDown, Sparkles } from 'lucide-react';

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

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin': 
        return { 
          color: 'bg-gradient-to-r from-red-500 to-pink-500 text-white', 
          icon: Crown, 
          label: 'Administrator',
          description: 'Full system access'
        };
      case 'editor': 
        return { 
          color: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white', 
          icon: Shield, 
          label: 'Editor',
          description: 'Content management'
        };
      case 'viewer': 
        return { 
          color: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white', 
          icon: Eye, 
          label: 'Viewer',
          description: 'Read-only access'
        };
      case 'data_entry': 
        return { 
          color: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white', 
          icon: Users, 
          label: 'Data Entry',
          description: 'Data input specialist'
        };
      default: 
        return { 
          color: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white', 
          icon: User, 
          label: 'User',
          description: 'Standard access'
        };
    }
  };

  const roleConfig = getRoleConfig(profile.role);
  const RoleIcon = roleConfig.icon;

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center space-x-3 px-3 py-2 h-auto hover:bg-accent/50 transition-all duration-base rounded-xl shadow-subtle hover:shadow-elegant group"
          >
            <div className="relative">
              <Avatar className="h-9 w-9 ring-2 ring-primary/10 shadow-elegant transition-all duration-base group-hover:ring-primary/20 group-hover:shadow-premium">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-sm">
                  {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 
                   profile?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full ring-2 ring-background shadow-sm">
                <div className="w-full h-full bg-success rounded-full animate-pulse opacity-60"></div>
              </div>
            </div>
            
            <div className="flex flex-col items-start space-y-0.5 min-w-0">
              <div className="font-display font-semibold text-foreground text-sm truncate max-w-32">
                {profile.full_name || profile.username}
              </div>
              <div className="flex items-center space-x-1">
                <RoleIcon className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium capitalize">
                  {roleConfig.label}
                </span>
              </div>
            </div>
            
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-80 p-0 glass-card rounded-2xl border-0" 
          align="end"
          sideOffset={8}
        >
          {/* Profile Header */}
          <div className="relative p-6 bg-gradient-subtle rounded-t-2xl">
            <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-t-2xl"></div>
            <div className="relative flex items-start space-x-4">
              <div className="relative">
                <Avatar className="h-16 w-16 ring-4 ring-background shadow-premium">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold text-xl">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 
                     profile?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full ring-3 ring-background shadow-lg flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-lg text-foreground truncate">
                  {profile.full_name || profile.username}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  @{profile.username}
                </p>
                
                <div className="flex items-center space-x-2 mt-3">
                  <Badge className={`${roleConfig.color} px-3 py-1 text-xs font-semibold shadow-elegant`}>
                    <RoleIcon className="h-3 w-3 mr-1.5" />
                    {roleConfig.label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-4 space-y-3 border-b border-border/50">
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center justify-center w-8 h-8 bg-accent/10 rounded-lg">
                <Mail className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Email</p>
                <p className="text-muted-foreground text-xs">{profile.username}</p>
              </div>
            </div>
            
            {profile.department && (
              <div className="flex items-center space-x-3 text-sm">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Department</p>
                  <p className="text-muted-foreground text-xs">{profile.department}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center justify-center w-8 h-8 bg-muted/30 rounded-lg">
                <RoleIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Access Level</p>
                <p className="text-muted-foreground text-xs">{roleConfig.description}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem 
                  className="cursor-pointer p-3 rounded-xl hover:bg-accent/50 transition-colors"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Settings className="mr-3 h-4 w-4 text-primary" />
                  <span className="font-medium">Edit Profile</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md glass-card">
                <DialogHeader className="text-center space-y-3">
                  <DialogTitle className="font-display text-xl">Edit Profile</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Update your profile information and preferences
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="font-medium">Full Name</Label>
                    <Input
                      id="full_name"
                      value={editData.full_name}
                      onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="font-medium">Username</Label>
                    <Input
                      id="username"
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="font-medium">Department</Label>
                    <Input
                      id="department"
                      value={editData.department}
                      onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} className="flex-1">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <DropdownMenuSeparator className="my-2" />
            
            <DropdownMenuItem 
              onClick={signOut}
              className="cursor-pointer p-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span className="font-medium">Sign Out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserProfileCard;
