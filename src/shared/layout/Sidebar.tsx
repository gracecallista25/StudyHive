import { Bell, GraduationCap, House, Lightbulb, MessageCircle, UserRound, Users, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CampusArt, LeafMark } from '../components/Artwork';

type ActivePage = 'home' | 'buddy' | 'profile' | 'groups' | 'notifications' | 'projects';

const upcoming = [

  { label: 'Ask a Senior', icon: GraduationCap },

  { label: 'Messages', icon: MessageCircle },
];

interface SidebarProps {
  active?: ActivePage;
}

function NavigationLink({ href, label, icon: Icon, active = false }: { href: string; label: string; icon: LucideIcon; active?: boolean }) {
  return <a className={'nav-item' + (active ? ' active' : '')} href={href} aria-current={active ? 'page' : undefined}><Icon size={23} /><span>{label}</span></a>;
}

export function Sidebar({ active = 'buddy' }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand"><LeafMark /><div><span className="brand-name">StudyHive</span><p>HITSZ · Shenzhen</p></div></div>
      <nav aria-label="Main navigation">
        <NavigationLink href="#home" label="Home" icon={House} active={active === 'home'} />
        <NavigationLink href="#study-buddy" label="Study Buddy" icon={Users} active={active === 'buddy'} />
        <NavigationLink href="#study-groups" label="Study Groups" icon={UsersRound} active={active === 'groups'} />
        <NavigationLink href="#projects" label="Projects" icon={Lightbulb} active={active === 'projects'} />
        {upcoming.map(({ label, icon: Icon }) => (
          <div key={label}>
            <span className="nav-item upcoming" aria-disabled="true" title={label + ' is planned for a later release'}><Icon size={23} /><span>{label}</span><span className="soon">Soon</span></span>
          </div>
        ))}
        <div className="nav-divider"><NavigationLink href="#notifications" label="Notifications" icon={Bell} active={active === 'notifications'} /></div>
        <NavigationLink href="#profile" label="My Profile" icon={UserRound} active={active === 'profile'} />
      </nav>
      <div className="sidebar-bottom"><CampusArt /><p>Same campus.<br />Brighter together.</p></div>
    </aside>
  );
}
