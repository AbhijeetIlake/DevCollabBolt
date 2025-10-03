/**
 * Landing Page Component
 * Beautiful landing page with hero section and features
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Users, Zap, Shield, GitBranch, Play, Share2, Lock, Globe, ArrowRight, Star, CircleCheck as CheckCircle } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Code,
      title: "Smart Code Editor",
      description: "Monaco Editor with syntax highlighting, IntelliSense, and multi-language support for seamless coding experience.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Real-time Collaboration",
      description: "Work together with your team in real-time. File locking, live cursors, and instant synchronization.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: GitBranch,
      title: "Version Control",
      description: "Built-in version history for both snippets and workspace files. Never lose your work again.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Play,
      title: "Code Execution",
      description: "Run JavaScript and Python code directly in the browser with real-time output and error handling.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Share2,
      title: "Easy Sharing",
      description: "Share code snippets with public links, collaborate on workspaces, and invite team members instantly.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "JWT authentication, encrypted data, and granular privacy controls keep your code safe and secure.",
      color: "from-teal-500 to-blue-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Developers" },
    { number: "50K+", label: "Code Snippets" },
    { number: "5K+", label: "Workspaces" },
    { number: "99.9%", label: "Uptime" }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="relative z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                DevCollab
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient relative py-20 lg:py-32">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full px-4 py-2 mb-8">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-300">Trusted by 10,000+ developers worldwide</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Code Together,
              </span>
              <br />
              <span className="text-white">Build Better</span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              The ultimate collaborative development platform. Share code snippets, work in real-time workspaces, 
              and build amazing projects with your team.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-4 group"
              >
                Start Coding Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="btn-secondary text-lg px-8 py-4"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-800/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Everything you need to
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> collaborate</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Powerful features designed for modern development teams and individual developers alike.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card group">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-slate-800/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              How it works
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Get started in minutes with our intuitive platform
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Create Account</h3>
              <p className="text-slate-300">Sign up for free and get instant access to all features</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Start Coding</h3>
              <p className="text-slate-300">Create snippets or workspaces and invite your team</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Collaborate</h3>
              <p className="text-slate-300">Work together in real-time and build amazing projects</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to start collaborating?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of developers who are already using DevCollab to build better software together.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/register"
              className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-colors text-lg"
            >
              Sign In
            </Link>
          </div>
          
          <div className="mt-8 flex items-center justify-center space-x-6 text-blue-100">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Setup in 2 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">DevCollab</span>
            </div>
            
            <div className="text-slate-400 text-center md:text-right">
              <p>&copy; 2024 DevCollab. Built with ❤️ for developers.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;