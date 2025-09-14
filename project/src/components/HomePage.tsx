'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Book, 
  Upload, 
  Zap, 
  Brain, 
  Users, 
  MessageCircle,
  Play,
  CheckCircle,
  ArrowRight,
  Star,
  Quote,
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react';
import Button from './ui/Button';
import { Card, CardContent } from './ui/Card';
import Header from './ui/Header';
import Footer from './ui/Footer';
import { useSession } from '../utils/hooks/useSession';

const HomePage: React.FC = () => {
  const router = useRouter();
  const { session } = useSession()

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Transform any document into an interactive learning experience with advanced AI technology.',
      color: 'from-primary-500 to-primary-600'
    },
    {
      icon: MessageCircle,
      title: 'Interactive Discussions',
      description: 'Engage in realistic classroom discussions with AI students and teachers.',
      color: 'from-secondary-500 to-secondary-600'
    },
    {
      icon: Upload,
      title: 'Easy Document Upload',
      description: 'Simply upload your PDF or DOCX files and let AI create engaging lectures.',
      color: 'from-accent-500 to-accent-600'
    },
    {
      icon: Users,
      title: 'Collaborative Learning',
      description: 'Learn alongside AI-generated students in a simulated classroom environment.',
      color: 'from-primary-600 to-secondary-500'
    },
    {
      icon: Zap,
      title: 'Instant Processing',
      description: 'Get your interactive lectures ready in minutes, not hours.',
      color: 'from-warning-500 to-error-500'
    },
    {
      icon: Play,
      title: 'Audio Narration',
      description: 'Listen to AI-generated audio explanations and discussions.',
      color: 'from-secondary-600 to-accent-500'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload Your Document',
      description: 'Upload any PDF or DOCX file containing your learning material.',
      icon: Upload
    },
    {
      number: '02',
      title: 'AI Processing',
      description: 'Our AI analyzes your content and creates structured learning sections.',
      icon: Brain
    },
    {
      number: '03',
      title: 'Interactive Learning',
      description: 'Engage with AI-generated discussions and explanations.',
      icon: MessageCircle
    },
    {
      number: '04',
      title: 'Master the Content',
      description: 'Learn through interactive conversations and Q&A sessions.',
      icon: CheckCircle
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Graduate Student',
      avatar: '👩‍🎓',
      content: 'AI Classroom transformed how I study complex research papers. The interactive discussions help me understand concepts I would have struggled with alone.',
      rating: 5
    },
    {
      name: 'Dr. Michael Rodriguez',
      role: 'Professor',
      avatar: '👨‍🏫',
      content: 'I use this to create engaging supplementary materials for my courses. Students love the interactive format and retain information much better.',
      rating: 5
    },
    {
      name: 'Emily Johnson',
      role: 'Professional',
      avatar: '👩‍💼',
      content: 'Perfect for professional development. I can quickly turn industry reports into interactive learning sessions during my commute.',
      rating: 5
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Learners', icon: Users },
    { number: '50,000+', label: 'Documents Processed', icon: Book },
    { number: '99.9%', label: 'Uptime', icon: TrendingUp },
    { number: '4.9/5', label: 'User Rating', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header isLandingPage={true} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute top-40 left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </div>


        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Powered by Advanced AI</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Documents into
              <span className="block bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 bg-clip-text text-transparent">
                Interactive Learning
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Upload any document and experience AI-powered classroom discussions with virtual students and teachers. 
              Learn faster, understand deeper.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                size="lg"
                onClick={() => session ? router.push('/documents') : router.push('/auth/signin')}
                className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white shadow-xl px-8 py-4 text-lg"
                icon={<Upload className="h-5 w-5" />}
              >
                {session ? 'Go to Dashboard' : 'Start Learning Free'}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 text-lg border-2 hover:bg-gray-50"
                icon={<Play className="h-5 w-5" />}
              >
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="h-6 w-6 text-primary-600 mr-2" />
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">
                      {stat.number}
                    </div>
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for
              <span className="block text-primary-600">Modern Learning</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of education with AI-powered interactive learning that adapts to your pace and style.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-apple-lg hover:shadow-apple-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes with our simple four-step process.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary-200 to-transparent transform -translate-x-1/2" />
                )}
                
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <step.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {step.number}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Loved by Learners
              <span className="block text-primary-600">Worldwide</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of students, professionals, and educators who are transforming their learning experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <Card className="h-full border-0 shadow-apple-lg hover:shadow-apple-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    <Quote className="h-8 w-8 text-primary-300 mb-4" />
                    
                    <p className="text-gray-700 mb-6 leading-relaxed italic">
                      "{testimonial.content}"
                    </p>
                    
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl mr-4">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                        <div className="text-gray-600 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of learners who are already experiencing the future of education with AI Classroom.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button
                size="lg"
                onClick={() => session ? router.push('/documents') : router.push('/auth/signin')}
                className="bg-white text-primary-600 hover:bg-gray-50 shadow-xl px-8 py-4 text-lg font-semibold"
                icon={<ArrowRight className="h-5 w-5" />}
              >
                {session ? 'Go to Dashboard' : 'Get Started Free'}
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-6 text-primary-100 text-sm">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                <span>Enterprise-grade security</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>Setup in under 2 minutes</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
