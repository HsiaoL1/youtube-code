import { Bell, Menu, Mic, Moon, Search, Sun, Video } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';
import { useSidebarStore } from '@/store/sidebar-store';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api/client';

export function TopNav() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clearSession);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const toggleSidebar = useSidebarStore((s) => s.toggle);
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);

  return (
    <header className="sticky top-0 z-30 bg-background">
      <div className="flex h-14 items-center gap-2 px-4">
        {/* Left: hamburger + logo */}
        <div className="flex flex-1 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileOpen(true);
              } else {
                toggleSidebar();
              }
            }}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/" className="flex items-center gap-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4">
                <polygon points="9.5,7.5 16.5,12 9.5,16.5" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">Youtobe</span>
          </Link>
        </div>

        {/* Center: search bar */}
        <form
          className="hidden w-full max-w-xl items-center md:flex"
          onSubmit={(e) => {
            e.preventDefault();
            const q = new FormData(e.currentTarget).get('q')?.toString().trim();
            if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
          }}
        >
          <div className="flex w-full">
            <input
              name="q"
              placeholder="Search"
              className="h-10 w-full rounded-l-full border border-r-0 bg-background px-4 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="flex h-10 w-16 items-center justify-center rounded-r-full border bg-secondary hover:bg-secondary/80"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
          <Button variant="ghost" size="icon" className="ml-2 rounded-full bg-secondary" type="button">
            <Mic className="h-4 w-4" />
          </Button>
        </form>

        {/* Right: actions */}
        <div className="flex flex-1 items-center justify-end gap-1">
          {user && (
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/studio/upload')}>
              <Video className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="h-5 w-5" />
            {user && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {user ? (
            <button
              className="ml-1 h-8 w-8 overflow-hidden rounded-full"
              onClick={async () => {
                await authApi.logout();
                clear();
                navigate('/login');
              }}
            >
              <img src={user.avatarUrl} className="h-full w-full object-cover" alt={user.name} />
            </button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="ml-1 gap-1 rounded-full border-primary/50 text-primary"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
