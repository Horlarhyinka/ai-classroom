"use client";

import React, { useState } from 'react';
import { Book, Upload, Settings, LogOut, Menu, X, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Button from './ui/Button';
import SignInButton from './auth/SignInButton';
import ProtectedRoute from './auth/ProtectedRoute';
import Header from './ui/Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const location = usePathname();
  
  // Check if we're on the landing page or auth pages
  const isLandingPage = location === '/';
  const isAuthPage = location?.startsWith('/auth');
  
  // If it's the landing page or auth page, don't show the sidebar layout
  if (isLandingPage || isAuthPage) {
    return <>{children}</>;
  }
  
  const navItems = [
    { label: 'Home', icon: <Home className="h-5 w-5" />, path: '/' },
    { label: 'My Documents', icon: <Book className="h-5 w-5" />, path: '/documents' },
    { label: 'Upload', icon: <Upload className="h-5 w-5" />, path: '/upload' },
    { label: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/settings' },
  ];
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  return (
    <SessionProvider>

    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile sidebar backdrop */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 z-20 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>
        
        {/* Sidebar */}
        <motion.aside
          className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-sm z-30 lg:relative lg:translate-x-0 lg:shadow-none transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          animate={{ x: isSidebarOpen ? 0 : -320 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-primary-500 text-white p-1 rounded">
                  <Book className="h-6 w-6" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">AI Notebook</h1>
              </div>
              <button
                className="lg:hidden rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-100"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <button
                      onClick={() => {
                        router.push(item.path);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="p-4 border-t border-gray-100">
              <SignInButton
                variant="outline"
                className="w-full justify-start"
              />
            </div>
          </div>
        </motion.aside>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="flex items-center justify-between p-4">
              <button
                className="lg:hidden rounded-full h-10 w-10 flex items-center justify-center hover:bg-gray-100"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-6 w-6 text-gray-700" />
              </button>
              
              <div className="flex-1 px-4">
                <h1 className="text-xl font-semibold text-gray-900 truncate lg:hidden">
                  AI Notebook
                </h1>
              </div>
              
              <div className="flex items-center space-x-3">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="h-10 w-10 rounded-full border-2 border-primary-100"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
    </SessionProvider>
  );
};

export default Layout;