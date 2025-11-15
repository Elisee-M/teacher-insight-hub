import { NavLink } from '@/components/NavLink';
import { LayoutDashboard, Users } from 'lucide-react';

export function Navigation() {
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center h-16">
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
      </div>
    </nav>
  );
}
