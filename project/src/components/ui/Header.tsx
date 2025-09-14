'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Book, Menu, X, Upload, FileText} from 'lucide-react';
import Button from './Button';
import SignInButton from '../auth/SignInButton';
import { useSession } from '../../utils/hooks/useSession';

interface HeaderProps {
  isLandingPage?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isLandingPage = false }) => {
  const router = useRouter();
  const {session, loading} = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isLandingPage
          ? 'bg-white/55 backdrop-blur-md shadow-apple-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                <Book className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent `}>
                AI Classroom
              </h1>
              <p className={`text-xs font-medium ${
                !isScrolled && isLandingPage ? 'text-white/80' : 'text-gray-500'
              }`}>
                Learn Smarter
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          {isLandingPage && (
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                     'text-gray-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {isLandingPage ? (
              <>
                {session?.token ? (
                  <SignInButton 
                    variant="ghost" 
                    size="sm" 
                    showProfile={true}
                    className={!isScrolled ? 'text-white hover:bg-white/10' : ''}
                  />
                ) : (
                  <>
                    <SignInButton
                      variant="ghost"
                      size="sm"
                      className={`hidden sm:flex `}
                    />
                    <Button
                      size="sm"
                      onClick={() =>{
                         router.push('/auth/signin')
                        // console.log('signing in...')
                        }}
                      className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white shadow-lg"
                      icon={<Upload className="h-4 w-4" />}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                {session?.token ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/documents')}
                      icon={<FileText className="h-4 w-4" />}
                      className="hidden sm:flex"
                    >
                      Documents
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => router.push('/upload')}
                      icon={<Upload className="h-4 w-4" />}
                    >
                      Upload
                    </Button>
                    <SignInButton showProfile={true} />
                  </>
                ) : (
                  <SignInButton />
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                !isScrolled && isLandingPage
                  ? 'text-white hover:bg-white/10'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md"
          >
            <div className="py-4 space-y-3">
              {isLandingPage && navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="px-4 pt-3 border-t border-gray-200 space-y-2">
                {!session ? (
                  <>
                    <SignInButton
                      variant="outline"
                      size="sm"
                      className="w-full justify-center"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        router.push('/auth/signin');
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-center bg-gradient-to-r from-primary-600 to-accent-600"
                      icon={<Upload className="h-4 w-4" />}
                    >
                      Get Started
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        router.push('/documents');
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-center"
                    >
                      Documents
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        router.push('/upload');
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-center"
                      icon={<Upload className="h-4 w-4" />}
                    >
                      Upload
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;