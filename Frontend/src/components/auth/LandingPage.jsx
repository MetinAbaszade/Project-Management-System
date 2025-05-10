import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-8 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mr-3" />
          <span className="text-xl font-semibold text-gray-900 dark:text-white">TaskUp</span>
        </div>
        <div className="space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero Section - Centered */}
      <div className="flex-grow flex items-center justify-center px-8 md:px-16 max-w-5xl mx-auto w-full">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white animate-fade-in">
            TaskUp.
            <span className="block text-blue-600 dark:text-blue-400">
              Focused work, beautifully managed.
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '200ms'}}>
            The intelligent project management platform that helps teams plan, track, and deliver their best work.
          </p>
          <div className="flex justify-center animate-fade-in" style={{animationDelay: '400ms'}}>
            <Link
              to="/signup"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg transition-colors text-center hover:scale-105 transform transition-transform duration-200"
            >
              Get Started — It's Free
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Everything you need to manage your projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Task Management',
                description:
                  'Create, assign, and track tasks with ease. Set priorities, deadlines, and keep everyone on the same page.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                ),
              },
              {
                title: 'Team Collaboration',
                description:
                  'Bring your team together. Communicate, share updates, and collaborate in real-time on projects.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                ),
              },
              {
                title: 'Project Analytics',
                description:
                  'Get insights into your project performance. Track progress, identify bottlenecks, and make data-driven decisions.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                ),
              },
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-750 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1">
                <div className="text-blue-600 dark:text-blue-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-2" />
            <span className="text-gray-800 dark:text-white font-medium">TaskUp</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © 2025 TaskUp. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;