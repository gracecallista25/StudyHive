import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
export function AppLayout({ children, active = 'buddy' }: { children: ReactNode; active?: 'home' | 'buddy' | 'profile' | 'groups' }) {
  return <><a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById("main-content")?.focus(); }}>Skip to main content</a><div className="app-shell"><Sidebar active={active}/><main id="main-content" tabIndex={-1}>{children}</main></div></>;
}
