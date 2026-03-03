import React from 'react';
import { Layout } from './components/Layout';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { ReportGenerator } from './components/ReportGenerator';
import { AuthPage } from './components/Auth/AuthPage';
import { BusinessData, AnalysisResults, User } from './types';
import { analyzeBusinessData } from './utils/analysis';
import { authService } from './services/authService';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [businessData, setBusinessData] = React.useState<BusinessData[]>([]);
  const [analysisResults, setAnalysisResults] = React.useState<AnalysisResults | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);

  React.useEffect(() => {
    const initAuth = async () => {
      const session = authService.getSession();
      if (session) {
        try {
          const response = await fetch(`/api/auth/session/${session.id}`);
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            await fetchUserData(userData.id);
          } else {
            console.warn("Session verification failed, logging out...");
            handleLogout();
          }
        } catch (err) {
          console.error("Session verification error:", err);
          handleLogout();
        }
      }
      setIsAuthLoading(false);
    };
    initAuth();
  }, []);

  const fetchUserData = async (userId: string) => {
    console.log(`Fetching data for user: ${userId}`);
    try {
      const response = await fetch(`/api/data/${userId}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`Successfully fetched ${data.length} rows for user: ${userId}`);
        if (data.length > 0) {
          setBusinessData(data);
          setAnalysisResults(analyzeBusinessData(data));
        }
      } else if (response.status === 401) {
        console.warn(`Stale session detected for user ${userId}, logging out...`);
        handleLogout();
      } else {
        console.error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    fetchUserData(userData.id);
  };

  const handleLogout = () => {
    authService.signOut();
    setUser(null);
    setBusinessData([]);
    setAnalysisResults(null);
  };

  const handleDataLoaded = (data: BusinessData[]) => {
    setBusinessData(data);
    const results = analyzeBusinessData(data);
    setAnalysisResults(results);
    setActiveTab('dashboard');
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  if (isAuthLoading) {
    return (
      <div className={isDarkMode ? "bg-zinc-950 min-h-screen flex items-center justify-center" : "bg-zinc-50 min-h-screen flex items-center justify-center"}>
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} isDarkMode={isDarkMode} />;
  }

  const renderContent = () => {
    if (businessData.length === 0 && activeTab !== 'upload') {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-zinc-500 mb-8 max-w-sm">Welcome, {user.name}! Please upload your business metrics in CSV format to start the analysis.</p>
          <button 
            onClick={() => setActiveTab('upload')}
            className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-colors"
          >
            Go to Upload
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return analysisResults ? <Dashboard data={businessData} results={analysisResults} isDarkMode={isDarkMode} /> : null;
      case 'upload':
        return <FileUpload onDataLoaded={handleDataLoaded} isDarkMode={isDarkMode} userId={user.id} onAuthError={handleLogout} />;
      case 'reports':
        return analysisResults ? <ReportGenerator data={businessData} results={analysisResults} isDarkMode={isDarkMode} /> : null;
      case 'settings':
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <div className="space-y-4">
              <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                <div>
                  <p className="font-bold">Dark Mode</p>
                  <p className="text-sm text-zinc-500">Toggle the application theme</p>
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/50">
                <p className="font-bold mb-1">Account Info</p>
                <p className="text-sm text-zinc-500">Signed in as {user.name} ({user.email})</p>
              </div>
              <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/50">
                <p className="font-bold mb-1">Data Management</p>
                <p className="text-sm text-zinc-500 mb-4">Your business data is securely synced with your personal account for persistent analysis across sessions.</p>
                <button 
                  onClick={() => { setBusinessData([]); setAnalysisResults(null); }}
                  className="text-red-500 text-sm font-bold hover:underline"
                >
                  Clear Current Analysis View
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      isDarkMode={isDarkMode} 
      toggleDarkMode={toggleDarkMode}
      user={user}
      onLogout={handleLogout}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
