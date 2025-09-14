'use client'

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Book, ArrowLeft, Shield, Zap, Users } from 'lucide-react';
import GoogleSignInButton from '../../../components/auth/GoogleSignInButton';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast'

export default function SignInPage({ sessionData }: { sessionData: any}) {
  const { data: session, loading: sessionLoading } = sessionData;
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/documents';
  useEffect(()=>{
    if(searchParams.get('error')){
      if(searchParams.get('message')){
        toast.error(searchParams.get('message'))
      }else{
        toast.error('Unable to sign in')
      }
    }
  },[])

  useEffect(() => {
      console.log({'Session data': session, sessionLoading})
    if (session?.token && session?.user) {
      router.push(callbackUrl);
    }
  }, [session, router, callbackUrl, sessionLoading]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Zap,
      title: 'Instant Setup',
      description: 'Get started in seconds with your Google account'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security'
    },
    {
      icon: Users,
      title: 'Collaborative',
      description: 'Share and collaborate on learning materials'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
              <Book className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Classroom</h1>
              <p className="text-sm text-gray-500">Learn Smarter</p>
            </div>
          </motion.div>
          
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Home
          </Button>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Left Side - Sign In Form */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-apple-lg p-8 border border-gray-100">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <Book className="h-8 w-8 text-white" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-600">
                  Sign in to continue your learning journey
                </p>
              </div>

              <div className="space-y-4">
                <GoogleSignInButton
                  size="lg"
                  className="w-full"
                  callbackUrl={callbackUrl}
                  onClick={()=>{router.push(process.env.NEXT_PUBLIC_API_BASE_URL! + '/auth/google')}}
                />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">
                      Secure authentication with Google
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs text-gray-500">
                  By signing in, you agree to our{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-700">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-700">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Features */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-6 bg-gradient-to-br from-primary-500 to-accent-600">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-lg text-white"
          >
            <h3 className="text-3xl font-bold mb-6">
              Transform Learning with AI
            </h3>
            <p className="text-primary-100 mb-8 text-lg">
              Upload your documents and create interactive learning experiences 
              with AI-powered classroom simulations.
            </p>
            
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  className="flex items-start space-x-4"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{feature.title}</h4>
                    <p className="text-primary-100 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-8 p-4 bg-white/10 rounded-xl border border-white/20"
            >
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>10,000+ Active Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span>99.9% Uptime</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}