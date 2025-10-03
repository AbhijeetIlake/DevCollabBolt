import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Users, Shield, Heart, GitBranch, Play, ArrowRight, Star, UserCheck, Zap, Globe } from 'lucide-react';

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
      icon: Heart,
      title: "Community Driven",
      description: "Like, share, and discover amazing code snippets from developers around the world.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "JWT authentication, encrypted data, and privacy controls keep your snippets safe and secure.",
      color: "from-teal-500 to-blue-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Developers" },
    { number: "50K+", label: "Code Snippets" },
    { number: "5K+", label: "Workspaces" },
    { number: "99.9%", label: "Uptime" }
  ];

  const testimonials = [
    {
      quote: "DevCollab transformed our team's workflow. Real-time collab is a game-changer!",
      author: "Sarah J., Lead Developer",
      avatar: "S"
    },
    {
      quote: "Love the Monaco integration and version control. Perfect for solo devs too!",
      author: "Mike R., Freelancer",
      avatar: "M"
    },
    {
      quote: "Secure, fast, and intuitive. We've built entire apps here.",
      author: "Team at TechCorp",
      avatar: "T"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Code className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                DevCollab
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white transition-all duration-300 px-6 py-3 rounded-xl hover:bg-slate-800/50 backdrop-blur-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center space-x-3 bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl px-6 py-3 mb-10 shadow-xl">
              <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span className="text-lg text-slate-200 font-medium">Trusted by 10,000+ developers worldwide</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Code Together,
              </span>
              <br />
              <span className="text-white">Build Better</span>
            </h1>
            
            <p className="text-2xl text-slate-200 mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">
              The ultimate collaborative development platform. Share code snippets, work in real-time workspaces, 
              and build amazing projects with your team—all in one secure space.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8">
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl px-10 py-5 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 group inline-flex items-center"
              >
                Start Coding Free
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-slate-300/50 text-slate-200 font-semibold text-xl px-10 py-5 rounded-2xl hover:bg-slate-800/30 hover:border-white transition-all duration-300 backdrop-blur-sm"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
        
        {/* Enhanced Floating Elements */}
        <div className="absolute top-1/4 left-5 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-1/4 right-5 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-bounce delay-1000"></div>
        <div className="absolute top-1/2 left-1/5 w-20 h-20 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1500"></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-800/30 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-default">
                <div className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-slate-300 text-lg font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-8 tracking-tight">
              Everything you need to
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> collaborate</span>
            </h2>
            <p className="text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Powerful features designed for modern development teams and individual developers alike.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="feature-card bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/70 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-2 group cursor-pointer"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-blue-300 transition-colors">{feature.title}</h3>
                  <p className="text-slate-300 leading-relaxed text-lg">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-8">
              How it works
            </h2>
            <p className="text-2xl text-slate-300 max-w-3xl mx-auto">
              Get started in minutes with our intuitive platform
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            {[
              { icon: UserCheck, title: "Create Account", desc: "Sign up for free and get instant access to all features", color: "from-blue-500 to-purple-600" },
              { icon: Zap, title: "Start Coding", desc: "Create snippets or workspaces and invite your team", color: "from-purple-500 to-pink-600" },
              { icon: Globe, title: "Collaborate", desc: "Work together in real-time and build amazing projects", color: "from-pink-500 to-red-600" }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center group">
                  <div className={`w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-6">{step.title}</h3>
                  <p className="text-slate-300 text-lg leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-800/40">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">What developers are saying</h2>
            <p className="text-xl text-slate-300">Join the community that's revolutionizing collaboration</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-900/70 transition-all duration-300 shadow-xl hover:shadow-2xl">
                <p className="text-slate-300 text-lg mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-slate-500 text-sm">Developer</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20"></div>
        <div className="container mx-auto px-6 relative text-center">
          <h2 className="text-5xl lg:text-6xl font-black text-white mb-8">
            Ready to start collaborating?
          </h2>
          <p className="text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Join thousands of developers who are already using DevCollab to build better software together.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8 mb-12">
            <Link
              to="/register"
              className="bg-white text-blue-600 font-bold text-xl px-12 py-6 rounded-2xl hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white font-bold text-xl px-12 py-6 rounded-2xl hover:bg-white hover:text-blue-600 transition-all duration-300 backdrop-blur-sm"
            >
              Sign In
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center justify-center space-x-8 text-blue-100 text-lg font-medium">
            <div className="flex items-center space-x-3">
              <UserCheck className="w-6 h-6" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6" />
              <span>Setup in 2 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-md border-t border-slate-800 py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">DevCollab</span>
            </div>
            
            <div className="text-slate-400 text-center md:text-right space-y-2">
              <p>&copy; 2024 DevCollab. Built with ❤️ for developers.</p>
              <p className="text-sm">Empowering collaboration worldwide.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
