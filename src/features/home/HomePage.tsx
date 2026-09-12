import { useEffect, useState } from 'react';
import { ArrowRight, Check, ClipboardList, GraduationCap, Lightbulb, MessageCircle, UserRound, Users, UsersRound } from 'lucide-react';
import { loadProfile } from '../profile/profileApi';
import { students } from '../study-buddy/students';
import { StudentAvatar } from '../study-buddy/StudentAvatar';
import './home.css';

const features = [
  { name: 'Study Buddy', description: 'Find students who want to study the same course or topic.', icon: Users, href: '#study-buddy' },
  { name: 'Ask a Senior', description: 'Get help from senior students who have already taken the course.', icon: GraduationCap },
  { name: 'Projects', description: 'Find teammates to work on projects, competitions, hackathons, or other ideas together.', icon: Lightbulb },
  { name: 'Study Groups', description: 'Find, join, or create study groups.', icon: UsersRound, href: '#study-groups' },
];
// Presence is a dashboard fixture, independent of study availability.
const onlineStudents = students;
const activities = [
  { text: 'Alex Wu accepted your study request.', time: '10 minutes ago', icon: Check },
  { text: 'Maya Tan sent you a message.', time: '35 minutes ago', icon: MessageCircle },
  { text: 'Lin Chen responded to your request.', time: '1 hour ago', icon: Users },
];

export function HomePage({ userId }: { userId: string | null }) {
  const [identity, setIdentity] = useState<{ id: string; name: string } | null>(null);
  const [profileFailed, setProfileFailed] = useState(false);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => {
    let cancelled = false;
    if (userId) loadProfile(userId).then(profile => {
      if (!cancelled) { setIdentity({ id: userId, name: profile.full_name.trim().split(/\s+/)[0] }); setProfileFailed(false); }
    }).catch(() => { if (!cancelled) setProfileFailed(true); });
    return () => { cancelled = true; };
  }, [userId]);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const name = identity?.id === userId ? identity?.name : '';
  return <div className="page-content home-page">
    <div className="home-account-bar">
      <span className="home-brand">StudyHive</span>
      <nav aria-label="Account navigation">
        <span aria-disabled="true" title="Requests is planned for a later release"><ClipboardList size={19} aria-hidden="true"/>Requests <small>Soon</small></span>
        <a href="#profile"><UserRound size={19} aria-hidden="true"/>My Profile</a>
      </nav>
    </div>
    <header className="home-welcome">
      <p className="breadcrumb">Campus <span>/</span><strong>Home</strong></p>
      <h1>{greeting}{name ? `, ${name}` : ''}!</h1>
      <p className="home-subtitle">What do you want to do today?</p>
      {userId && profileFailed && <p className="home-note" role="status">Your name could not be loaded. You can still explore the dashboard.</p>}
    </header>

    <section className="home-features" aria-label="Explore StudyHive">
      {features.map(({ name: title, description, icon: Icon, href }) => {
        const content = <><span className="home-feature-icon"><Icon size={26} aria-hidden="true"/></span><h2>{title}</h2><p>{description}</p><span className="home-feature-action">{href ? <>{title === 'Study Groups' ? 'Find a study room' : 'Find a study buddy'} <ArrowRight size={18} aria-hidden="true"/></> : 'Coming soon'}</span></>;
        return href ? <a className={'home-feature' + (title === 'Study Buddy' ? ' home-feature-primary' : '')} href={href} key={title}>{content}</a> : <article className="home-feature" key={title}>{content}</article>;
      })}
    </section>

    <div className="home-details">
      <section className="home-panel" aria-labelledby="home-online-title">
        <div className="home-panel-heading"><h2 id="home-online-title">Students Online</h2><span className="home-sample">Sample data</span></div>
        <p className="home-online-count"><span aria-hidden="true"/>{onlineStudents.length} students online</p>
        <div className="home-online-preview"><div className="home-avatar-stack">{onlineStudents.slice(0, 3).map(student => <span key={student.id} title={student.name}><StudentAvatar variant={student.avatar}/></span>)}</div><button className="reset-link" aria-expanded={showAll} aria-controls="home-online-list" onClick={() => setShowAll(!showAll)}>{showAll ? 'Show less' : 'View all'}</button></div>
        <p className="home-note">Active on StudyHive, not necessarily available to study.</p>
        <ul id="home-online-list" className="home-online-list" hidden={!showAll}>{onlineStudents.map(student => <li key={student.id}><StudentAvatar variant={student.avatar}/><span>{student.name}</span><span className="home-online-label">Online</span></li>)}</ul>
      </section>
      <section className="home-panel home-activity" aria-labelledby="home-activity-title">
        <div className="home-panel-heading"><h2 id="home-activity-title">Your Activity</h2><span className="home-sample">Sample data</span></div>
        <ul>{activities.map(({ text, time, icon: Icon }) => <li key={text}><span className="home-activity-icon"><Icon size={18} aria-hidden="true"/></span><div><p>{text}</p><span>{time}</span></div></li>)}</ul>
      </section>
    </div>
  </div>;
}
