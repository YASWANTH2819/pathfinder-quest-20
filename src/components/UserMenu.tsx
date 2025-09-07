import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Settings, User, Globe } from 'lucide-react';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      // User will be redirected to language selector
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56 glass-card" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem disabled className="cursor-default">
          <User className="mr-2 h-4 w-4" />
          <span>Profile (Coming Soon)</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem disabled className="cursor-default">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings (Coming Soon)</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem disabled className="cursor-default">
          <Globe className="mr-2 h-4 w-4" />
          <span>Language: {user.language.toUpperCase()}</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('auth.signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;