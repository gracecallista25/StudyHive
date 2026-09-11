import { Users, UsersRound, Lightbulb, GraduationCap, ClipboardList, UserRound } from 'lucide-react';
import { CampusArt, LeafMark } from '../components/Artwork';
const upcoming = [
  { label: 'Study Groups', icon: UsersRound }, { label: 'Projects', icon: Lightbulb },
  { label: 'Ask a Senior', icon: GraduationCap }, { label: 'Requests', icon: ClipboardList },
  { label: 'My Profile', icon: UserRound },
];
export function Sidebar() {
  return <aside className="sidebar">
    <div className="brand"><LeafMark/><div><span className="brand-name">StudyHive</span><p>HITSZ · Shenzhen</p></div></div>
    <nav aria-label="Main navigation">
      <a className="nav-item active" href="#study-buddy" aria-current="page"><Users size={23}/><span>Study Buddy</span></a>
      {upcoming.map(({ label, icon: Icon }, index) => <div className={index === 3 ? 'nav-divider' : ''} key={label}>
        <span className="nav-item upcoming" aria-disabled="true" title={label + ' is planned for a later release'}><Icon size={23}/><span>{label}</span><span className="soon">Soon</span></span>
      </div>)}
    </nav>
    <div className="sidebar-bottom"><CampusArt/><p>Same campus.<br/>Brighter together.</p></div>
  </aside>;
}
