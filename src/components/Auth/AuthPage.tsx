import React from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, PieChart } from 'lucide-react';
import { cn } from '../../utils/helpers';
import { authService } from '../../services/authService';
import { User } from '../../types';
import { motion } from 'motion/react';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
  isDarkMode: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, isDarkMode }) => {
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let user: User;
      if (isLogin) {
        user = await authService.signIn({ email, password });
      } else {
        user = await authService.signUp({ email, name, password });
      }
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-6 transition-colors duration-300",
      isDarkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"
    )}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "w-full max-w-md p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border shadow-2xl",
          isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        )}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <PieChart className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">VisionDesk</h1>
          <p className="text-zinc-500 mt-2">{isLogin ? 'Welcome back to your dashboard' : 'Create your business account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className={cn(
                    "w-full pl-12 pr-4 py-4 rounded-2xl border outline-none transition-all",
                    isDarkMode ? "bg-zinc-800 border-zinc-700 focus:border-emerald-500" : "bg-zinc-50 border-zinc-200 focus:border-emerald-500"
                  )}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className={cn(
                  "w-full pl-12 pr-4 py-4 rounded-2xl border outline-none transition-all",
                  isDarkMode ? "bg-zinc-800 border-zinc-700 focus:border-emerald-500" : "bg-zinc-50 border-zinc-200 focus:border-emerald-500"
                )}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  "w-full pl-12 pr-4 py-4 rounded-2xl border outline-none transition-all",
                  isDarkMode ? "bg-zinc-800 border-zinc-700 focus:border-emerald-500" : "bg-zinc-50 border-zinc-200 focus:border-emerald-500"
                )}
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg",
              isLoading 
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
            )}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-zinc-500 hover:text-emerald-500 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
