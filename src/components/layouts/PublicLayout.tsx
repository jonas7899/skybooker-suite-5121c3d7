import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, X, ChevronRight, Phone, Mail, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  const { isAuthenticated, logout } = useAuth();

  // Public links (no auth required)
  const publicLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/hirek', label: t('nav.news') },
    { href: '/rolam', label: t('nav.about') },
  ];

  // Protected links (auth required)
  const protectedLinks = [
    { href: '/kapcsolat', label: t('nav.contact') },
    { href: '/arckepcsarnok', label: t('nav.gallery') },
    { href: '/forum', label: t('nav.forum') },
  ];

  const allLinks = [...publicLinks, ...protectedLinks];

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.toLocaleString('hu-HU', { month: 'long' });
    const day = now.getDate();
    const dayName = now.toLocaleString('hu-HU', { weekday: 'long' });
    // Get name day (simplified - just showing a placeholder)
    const nameDays: Record<string, string> = {
      '12-7': 'Ambrus',
      '12-8': 'Mária',
      '12-9': 'Natália',
    };
    const nameDay = nameDays[`${now.getMonth() + 1}-${day}`] || 'Névnap';
    
    return `${year}. ${month} ${day}. ${dayName.charAt(0).toUpperCase() + dayName.slice(1)} - ${nameDay}`;
  };

  return (
    <div className="min-h-screen flex flex-col sky-background">
      {/* Date Bar */}
      <div className="bg-secondary/50 py-1 px-4 text-sm text-muted-foreground text-center border-b border-border">
        {getCurrentDate()}
      </div>

      {/* Header with Logo */}
      <header className="relative header-background py-6 overflow-hidden">
        <div className="jet-overlay" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between">
            <Link to="/" className="block">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary tracking-wide drop-shadow-sm">
                VÁRI GYULA
              </h1>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <LanguageSwitcher />
              {isAuthenticated ? (
                <Button variant="outline" size="sm" onClick={logout}>
                  {t('auth.logout')}
                </Button>
              ) : (
                <Button variant="default" size="sm" asChild>
                  <Link to="/belepes">{t('auth.login')}</Link>
                </Button>
              )}
            </div>
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {allLinks.map((link) => {
              const isProtected = protectedLinks.some(p => p.href === link.href);
              const showLock = isProtected && !isAuthenticated;
              
              return (
                <Link
                  key={link.href}
                  to={showLock ? '/belepes' : link.href}
                  className={cn(
                    "menu-item",
                    location.pathname === link.href && "menu-item-active"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ChevronRight className="w-4 h-4" />
                  {link.label}
                  {showLock && <Lock className="w-3 h-3 ml-auto opacity-50" />}
                </Link>
              );
            })}
            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <LanguageSwitcher />
              {isAuthenticated ? (
                <Button variant="outline" size="sm" onClick={logout} className="flex-1">
                  {t('auth.logout')}
                </Button>
              ) : (
                <Button variant="default" size="sm" asChild className="flex-1">
                  <Link to="/belepes">{t('auth.login')}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <main className="flex-1 order-2 lg:order-1">
            <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
              {/* Breadcrumb */}
              <div className="px-6 py-3 bg-secondary/30 border-b border-border flex items-center gap-2 text-sm">
                <Link to="/" className="text-primary hover:underline">🏠</Link>
                <span className="text-muted-foreground">Ön itt van:</span>
                <span className="font-medium text-foreground">
                  {allLinks.find(l => l.href === location.pathname)?.label || t('nav.home')}
                </span>
              </div>
              
              {/* Page Content */}
              <div className="p-6">
                <Outlet />
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 order-1 lg:order-2 space-y-6">
            {/* Main Menu */}
            <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
              <div className="bg-secondary/50 px-4 py-3 border-b border-border">
                <h3 className="font-display font-semibold text-foreground">{t('common.mainMenu')}</h3>
              </div>
              <nav className="p-3 space-y-1">
                {allLinks.map((link) => {
                  const isProtected = protectedLinks.some(p => p.href === link.href);
                  const showLock = isProtected && !isAuthenticated;
                  
                  return (
                    <Link
                      key={link.href}
                      to={showLock ? '/belepes' : link.href}
                      className={cn(
                        "menu-item text-sm",
                        location.pathname === link.href && "menu-item-active"
                      )}
                    >
                      <ChevronRight className="w-4 h-4" />
                      {link.label}
                      {showLock && <Lock className="w-3 h-3 ml-auto opacity-50" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Contact Info */}
            <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
              <div className="bg-secondary/50 px-4 py-3 border-b border-border">
                <h3 className="font-display font-semibold text-foreground">{t('common.contact')}</h3>
              </div>
              <div className="p-4">
                <img 
                  src="https://varigyula.hu/images/stories/0009_mid.jpg" 
                  alt="Vári Gyula" 
                  className="w-24 h-auto mb-4 rounded shadow-sm"
                />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="font-semibold">+3620 777-9000</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <a href="mailto:varigyula@varigyula.hu" className="text-primary hover:underline">
                      varigyula@varigyula.hu
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Box (when not authenticated) */}
            {!isAuthenticated && (
              <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
                <div className="bg-secondary/50 px-4 py-3 border-b border-border">
                  <h3 className="font-display font-semibold text-foreground">{t('auth.login')}</h3>
                </div>
                <div className="p-4">
                  <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); }}>
                    <Input 
                      type="text" 
                      placeholder={t('auth.username')} 
                      className="text-sm"
                    />
                    <Input 
                      type="password" 
                      placeholder={t('auth.password')} 
                      className="text-sm"
                    />
                    <div className="flex items-center gap-2 text-sm">
                      <input type="checkbox" id="remember" className="rounded" />
                      <label htmlFor="remember" className="text-muted-foreground">
                        {t('auth.rememberMe')}
                      </label>
                    </div>
                    <Button type="submit" size="sm" className="w-full">
                      {t('auth.login')}
                    </Button>
                  </form>
                  <div className="mt-4 space-y-1 text-xs">
                    <a href="#" className="text-primary hover:underline block">
                      {t('auth.forgotPassword')}
                    </a>
                    <p className="text-muted-foreground">
                      {t('auth.noAccount')}{' '}
                      <Link to="/regisztracio" className="text-primary hover:underline">
                        {t('auth.createAccount')}
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} Vári Gyula. {t('footer.rights')}</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
