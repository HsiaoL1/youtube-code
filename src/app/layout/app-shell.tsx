import { Link, Outlet } from 'react-router-dom';
import { SideNav } from './side-nav';
import { TopNav } from './top-nav';
import { useSidebarStore } from '@/store/sidebar-store';

export function AppShell() {
  const mobileOpen = useSidebarStore((s) => s.mobileOpen);
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);

  return (
    <div className="min-h-screen">
      <TopNav />
      <div className="flex">
        <SideNav />
        <main className="flex-1 p-4 transition-all duration-200">
          <Outlet />
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-60 overflow-y-auto bg-background p-3 md:hidden">
            <div className="mb-4 flex items-center gap-2 px-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4">
                  <polygon points="9.5,7.5 16.5,12 9.5,16.5" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight">Youtobe</span>
            </div>
            <MobileNav onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </div>
  );
}

function MobileNav({ onClose }: { onClose: () => void }) {
  // Re-use the same nav items inline for mobile
  const items = [
    { to: '/', label: 'Home' },
    { to: '/shorts', label: 'Shorts' },
    { to: '/subscriptions', label: 'Subscriptions' },
    { to: '/trending', label: 'Trending' },
    { to: '/live', label: 'Live' },
    { to: '/history', label: 'History' }
  ];

  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onClose}
          className="block rounded-lg px-3 py-2 text-sm hover:bg-accent"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
