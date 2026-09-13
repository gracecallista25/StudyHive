import type { MouseEvent, ReactNode } from 'react';
import { ArrowUpRight, Bell, BookOpen, GraduationCap, House, Lightbulb, MessageCircle, Sparkles, UserRound, Users, UsersRound } from 'lucide-react';
import { StudentAvatar } from '../shared/components';
import { UnreadChatBadge } from '../features/messages/UnreadChatBadge';
import { CampusArt, AcademicArt, LeafMark } from './components';

type ActivePage = 'home' | 'study-buddy' | 'profile' | 'study-groups' | 'notifications' | 'projects' | 'ask-senior' | 'messages';

function NavigationLink({ href, label, icon: Icon, active = false }: { href: string; label: string; icon: typeof House; active?: boolean }) {
  return <a className={'nav-item' + (active ? ' active' : '')} href={href} aria-current={active ? 'page' : undefined}><Icon size={23} /><span>{label}</span>{href === '#messages' && <UnreadChatBadge />}</a>;
}

function Sidebar({ active = 'study-buddy' }: { active?: ActivePage }) {
  return <aside className="sidebar"><div className="brand"><LeafMark /><div><span className="brand-name">StudyHive</span><p>HITSZ · Shenzhen</p></div></div><nav aria-label="Main navigation">
    <NavigationLink href="#home" label="Home" icon={House} active={active === 'home'} /><NavigationLink href="#study-buddy" label="Study Buddy" icon={Users} active={active === 'study-buddy'} /><NavigationLink href="#study-groups" label="Study Groups" icon={UsersRound} active={active === 'study-groups'} /><NavigationLink href="#projects" label="Projects" icon={Lightbulb} active={active === 'projects'} /><NavigationLink href="#ask-senior" label="Ask a Senior" icon={GraduationCap} active={active === 'ask-senior'} />
    <div className="nav-divider nav-account-group"><NavigationLink href="#messages" label="Messages" icon={MessageCircle} active={active === 'messages'} /><NavigationLink href="#notifications" label="Notifications" icon={Bell} active={active === 'notifications'} /><NavigationLink href="#profile" label="My Profile" icon={UserRound} active={active === 'profile'} /></div>
  </nav><div className="sidebar-bottom"><CampusArt /><p>Same campus.<br />Brighter together.</p></div></aside>;
}

export function AppLayout({ children, active = 'study-buddy' }: { children: ReactNode; active?: ActivePage }) {
  function focusMainContent(event: MouseEvent<HTMLAnchorElement>) { event.preventDefault(); document.getElementById('main-content')?.focus(); }
  return <><a className="skip-link" href="#main-content" onClick={focusMainContent}>Skip to main content</a><div className="app-shell"><Sidebar active={active} /><main id="main-content" tabIndex={-1}>{children}</main></div></>;
}

export function AuthLayout({ children, register = false }: { children: ReactNode; register?: boolean }) {
  const accountPrompt = register ? 'Already part of the hive?' : 'New to StudyHive?';
  const accountLink = register ? 'Log in' : 'Create an account';
  const accountHref = register ? '#login' : '#register';
  return <div className={'auth-shell' + (register ? ' auth-register' : '')}><aside className="auth-story" aria-label="Welcome to StudyHive"><a className="brand auth-brand" href="#login" aria-label="StudyHive login"><LeafMark /><div><span className="brand-name">StudyHive</span><p>HITSZ · Shenzhen</p></div></a><div className="auth-story-content"><p className="auth-campus-label"><span />A LITTLE CLOSER, ON CAMPUS</p><h1>{register ? <>A new chapter.<br />Better together.</> : <>Your people.<br />Your next chapter.</>}</h1><p className="auth-story-description">Find a study partner, share a little curiosity,<br className="desktop-break" /> and make campus feel a little more like home.</p><div className="auth-art-wrap"><AcademicArt /></div><div className="auth-story-notes"><span><BookOpen size={17} />Learn together</span><span><UsersRound size={17} />Find your people</span><span><Sparkles size={17} />Grow together</span></div></div><div className="auth-story-bottom"><p>Same campus.<br />Brighter together.</p><CampusArt /></div></aside><main className="auth-main"><div className="auth-topline"><span>{accountPrompt}</span><a href={accountHref}>{accountLink}<ArrowUpRight size={16} /></a></div><div className="auth-content">{children}</div><footer className="auth-footer"><div className="auth-avatar-stack"><StudentAvatar variant="lin" /><StudentAvatar variant="maya" /><StudentAvatar variant="yuna" /></div><p>A place for curious minds.<br /><strong>Made for HITSZ students.</strong></p><a href="#study-buddy">Explore demo<ArrowUpRight size={15} /></a></footer></main></div>;
}



