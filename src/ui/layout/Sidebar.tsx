import { Users, UsersRound, Lightbulb, GraduationCap, ClipboardList, UserRound } from 'lucide-react';
import { CampusArt, LeafMark } from '../components/Artwork';
const upcoming = [
  { label: 'Study Groups', icon: UsersRound }, { label: 'Projects', icon: Lightbulb },
  { label: 'Ask a Senior', icon: GraduationCap }, { label: 'Requests', icon: ClipboardList },
];
export function Sidebar({ active = 'buddy' }: { active?: 'buddy' | 'profile' }) {
  return <aside className="sidebar">
    <div className="brand"><LeafMark/><div><span className="brand-name">StudyHive</span><p>HITSZ · Shenzhen</p></div></div>
    <nav aria-label="Main navigation">
      <a className={"nav-item" + (active === "buddy" ? " active" : "")} href="#study-buddy" aria-current={active === "buddy" ? "page" : undefined}><Users size={23}/><span>Study Buddy</span></a>
      {upcoming.map(({ label, icon: Icon }, index) => <div className={index === 3 ? 'nav-divider' : ''} key={label}>
        <span className="nav-item upcoming" aria-disabled="true" title={label + ' is planned for a later release'}><Icon size={23}/><span>{label}</span><span className="soon">Soon</span></span>
      </div>)}
      <a className={"nav-item" + (active === "profile" ? " active" : "")} href="#profile" aria-current={active === "profile" ? "page" : undefined}><UserRound size={23}/><span>My Profile</span></a>
    </nav>
    <div className="sidebar-bottom"><CampusArt/><p>Same campus.<br/>Brighter together.</p></div>
  </aside>;
}
