import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
export function AppLayout({ children }: { children: ReactNode }) {
  return <><a className="skip-link" href="#study-buddy">Skip to study buddies</a><div className="app-shell"><Sidebar/><main id="study-buddy" tabIndex={-1}>{children}</main></div></>;
}
