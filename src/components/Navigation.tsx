import { NavLink } from '@/components/NavLink';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

export function Navigation() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center h-16 justify-between">
          <div className="flex items-center">
            <div className="flex items-center gap-2 mr-8">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Attendance Analyzer</span>
            </div>
            <div className="flex gap-1">
              <NavLink
                to="/"
                end
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent"
                activeClassName="bg-accent text-accent-foreground"
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/teachers"
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent"
                activeClassName="bg-accent text-accent-foreground"
              >
                Teachers
              </NavLink>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
