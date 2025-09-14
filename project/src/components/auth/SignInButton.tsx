'use client'

import React, { useState } from 'react';
import { useSession, logout } from '../../utils/hooks/useSession';
import { LogIn, LogOut, User } from 'lucide-react';
import Button from '../ui/Button';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

interface SignInButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showProfile?: boolean;
}

const SignInButton: React.FC<SignInButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  className = '',
  showProfile = false
}) => {
  const { session, loading } = useSession();
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  function handleLogout(){
    setLoggingOut(true)
    axios.get(process.env.NEXT_PUBLIC_API_BASE_URL! + '/auth/logout', {withCredentials: true})
    .then(res=>{
      if(res.status == 200){
        logout()
        router.push('/auth/signin')
      }
    })
    .catch((err)=>{
      toast.error('Error occured')
    })
    .finally(()=>{
      setLoggingOut(false)
    })
  }

  if (loading) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        disabled 
        className={className}
      >
        Loading...
      </Button>
    );
  }

  if (session?.user && session?.token) {
    if (showProfile) {
      return (
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {session.user?.picture ? (
              <img
                src={session.user.picture}
                alt={session.user.firstName || 'User'}
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-600" />
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {`${session.user?.lastName} ${session.user?.firstName}`}
              </p>
              <p className="text-xs text-gray-500">
                {session.user?.email}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleLogout()}
            icon={<LogOut className="h-4 w-4" />}
          >
            {loggingOut?"Signing out...":"Sign Out"}
          </Button>
        </div>
      );
    }

    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => handleLogout()}
        icon={<LogOut className="h-4 w-4" />}
        className={className}
      >
        Sign Out
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => {router.push('/auth/signin')}}
      icon={<LogIn className="h-4 w-4" />}
      className={className}
    >
      Sign In
    </Button>
  );
};

export default SignInButton;