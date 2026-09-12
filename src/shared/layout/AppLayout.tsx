import type { MouseEvent, ReactNode } from 'react';
import { Sidebar } from './Sidebar';

type ActivePage = 'home' | 'buddy' | 'profile' | 'groups' | 'notifications' | 'projects';

interface AppLayoutProps {
  children: ReactNode;
  active?: ActivePage;
}

export function AppLayout({ children, active = 'buddy' }: AppLayoutProps) {
  function focusMainContent(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    document.getElementById('main-content')?.focus();
  }

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={focusMainContent}>Skip to main content</a>
      <div className="app-shell">
        <Sidebar active={active} />
        <main id="main-content" tabIndex={-1}>{children}</main>
      </div>
    </>
  );
}
