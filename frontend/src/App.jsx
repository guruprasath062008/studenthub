import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();
  
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('studenthub_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('studenthub_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('studenthub_theme', 'light');
    }
  }, [darkMode]);

  // Navigation and View state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [authView, setAuthView] = useState(null); // null | 'login' | 'register'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navigation Bar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onOpenAuth={() => setAuthView('login')}
      />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        
        {/* Modern Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setAuthView(null);
          }}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {authView === 'login' ? (
            <Login
              onNavigateRegister={() => setAuthView('register')}
              onLoginSuccess={() => setAuthView(null)}
            />
          ) : authView === 'register' ? (
            <Register
              onNavigateLogin={() => setAuthView('login')}
              onRegisterSuccess={() => setAuthView(null)}
            />
          ) : (
            <Dashboard
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenAuth={() => setAuthView('login')}
            />
          )}
        </main>

      </div>
    </div>
  );
}
