import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { Crown, Moon, Sun, Brain } from 'lucide-react';
import { useTheme } from 'next-themes';

const Navbar = () => {
  const { user } = useUser();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/upload', label: 'Upload' },
    { path: '/task-setup', label: 'Setup' },
    { path: '/results', label: 'Results' },
    { path: '/deployment', label: 'Deploy' },
  ];

  return (
    <nav className="glass border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover-lift">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">AutoML-Agent</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? 'default' : 'ghost'}
                  size="sm"
                  className="font-medium"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* User Info & Theme Toggle */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* User Badge */}
            {user && (
              <div className="flex items-center space-x-2">
                {user.isPremium && (
                  <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-premium rounded-full">
                    <Crown className="w-4 h-4 text-premium-foreground" />
                    <span className="text-sm font-semibold text-premium-foreground">Premium</span>
                  </div>
                )}
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-foreground">{user.name}</div>
                  {!user.isPremium && (
                    <div className="text-xs text-muted-foreground">
                      {user.taskRunsUsed}/{user.maxTaskRuns} runs used
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;