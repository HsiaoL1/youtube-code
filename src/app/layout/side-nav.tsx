import { Link, useLocation } from 'react-router-dom';
import {
  Clapperboard,
  ChevronRight,
  Clock,
  Flame,
  History,
  Home,
  LayoutDashboard,
  Radio,
  Shield,
  ThumbsUp,
  Tv
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useSidebarStore } from '@/store/sidebar-store';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

const mainItems: NavItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/shorts', label: 'Shorts', icon: Clapperboard },
  { to: '/subscriptions', label: 'Subscriptions', icon: Tv }
];

const youItems: NavItem[] = [
  { to: '/history', label: 'History', icon: History },
  { to: '/playlist/p1', label: 'Watch Later', icon: Clock },
  { to: '/liked', label: 'Liked Videos', icon: ThumbsUp }
];

const exploreItems: NavItem[] = [
  { to: '/trending', label: 'Trending', icon: Flame },
  { to: '/live', label: 'Live', icon: Radio }
];

function NavLink({ item, collapsed, active }: { item: NavItem; collapsed: boolean; active: boolean }) {
  const Icon = item.icon;

  if (collapsed) {
    return (
      <Link
        to={item.to}
        className={cn(
          'flex flex-col items-center gap-1 rounded-lg px-1 py-3 text-[10px] hover:bg-accent',
          active && 'bg-accent font-semibold'
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="leading-tight">{item.label}</span>
      </Link>
    );
  }

  return (
    <Link
      to={item.to}
      className={cn(
        'flex items-center gap-5 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors',
        active && 'bg-accent font-semibold'
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

function Divider() {
  return <hr className="my-2 border-border" />;
}

export function SideNav() {
  const location = useLocation();
  const role = useAuthStore((s) => s.user?.role);
  const collapsed = useSidebarStore((s) => s.collapsed);

  const isActive = (to: string) => location.pathname === to;

  return (
    <aside
      className={cn(
        'hidden shrink-0 overflow-y-auto overflow-x-hidden border-r-0 md:block transition-all duration-200',
        collapsed ? 'w-[72px]' : 'w-60'
      )}
      style={{ height: 'calc(100vh - 56px)' }}
    >
      <nav className={cn('flex flex-col', collapsed ? 'items-center px-1 pt-1' : 'px-3 pt-2')}>
        {/* Main section */}
        {mainItems.map((item) => (
          <NavLink key={item.to} item={item} collapsed={collapsed} active={isActive(item.to)} />
        ))}

        <Divider />

        {/* You section */}
        {!collapsed && (
          <div className="flex items-center gap-1 px-3 py-2 text-sm font-medium">
            You <ChevronRight className="h-4 w-4" />
          </div>
        )}
        {youItems.map((item) => (
          <NavLink key={item.to} item={item} collapsed={collapsed} active={isActive(item.to)} />
        ))}

        <Divider />

        {/* Explore section */}
        {!collapsed && (
          <div className="px-3 py-2 text-sm font-medium">Explore</div>
        )}
        {exploreItems.map((item) => (
          <NavLink key={item.to} item={item} collapsed={collapsed} active={isActive(item.to)} />
        ))}

        {/* Creator / Admin */}
        {(role === 'creator' || role === 'admin') && (
          <>
            <Divider />
            <NavLink
              item={{ to: '/studio', label: 'Creator Studio', icon: LayoutDashboard }}
              collapsed={collapsed}
              active={isActive('/studio')}
            />
          </>
        )}
        {role === 'admin' && (
          <NavLink
            item={{ to: '/admin/dashboard', label: 'Admin', icon: Shield }}
            collapsed={collapsed}
            active={isActive('/admin/dashboard')}
          />
        )}
      </nav>
    </aside>
  );
}
