import { UnreadChatBadge } from '../messages/UnreadChatBadge';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Bell, GraduationCap, Lightbulb, MessageCircle, UserRound, Users, UsersRound } from 'lucide-react';
import { loadProfile } from '../profile/profile';
import { LeafMark } from '../../shared/components';
import campusBackground from './hitsz-campus.png';
import './home.css';

const features = [
  { name: 'Study Buddy', description: 'Find students who want to study the same course or topic.', action: 'Find a study buddy', icon: Users, href: '#study-buddy' },
  { name: 'Study Groups', description: 'Find, join, or create study groups.', action: 'Find a study room', icon: UsersRound, href: '#study-groups' },
  { name: 'Projects', description: 'Find teammates to work on projects, competitions, hackathons, or other ideas together.', action: 'Explore projects', icon: Lightbulb, href: '#projects' },
  { name: 'Ask a Senior', description: 'Get help from senior students who have already taken the course.', action: 'Meet the seniors', icon: GraduationCap, href: '#ask-senior' },
];

export function HomePage({ userId }: { userId: string | null }) {
  const [identity, setIdentity] = useState<{ id: string; name: string } | null>(null);
  const [profileFailed, setProfileFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (userId) {
      loadProfile(userId)
        .then(profile => {
          if (!cancelled) {
            setIdentity({ id: userId, name: profile.full_name.trim().split(/\s+/)[0] });
            setProfileFailed(false);
          }
        })
        .catch(() => {
          if (!cancelled) setProfileFailed(true);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const name = identity?.id === userId ? identity.name : '';

  return (
    <div className="page-content home-page">
      <div className="home-campus-hero"><img className="home-campus-background" src={campusBackground} alt="" fetchPriority="high" /><div className="home-account-bar">
        <a href="#home" className="home-brand" aria-label="StudyHive home"><LeafMark /><span>StudyHive</span><small>HITSZ · Shenzhen</small></a>
        <nav aria-label="Account navigation"><a href="#home" aria-current="page">Home</a>
          <a href="#notifications"><Bell size={19} aria-hidden="true" />Notifications</a>
          <a href="#messages"><MessageCircle size={19} aria-hidden="true" />Messages <UnreadChatBadge /></a>
          <a href="#profile"><UserRound size={19} aria-hidden="true" />My Profile</a>
        </nav>
      </div>

      <header className="home-welcome">
        <p className="breadcrumb">Campus <span>/</span><strong>Home</strong></p>
        <h1>{greeting}{name ? `, ${name}` : ''}!</h1>
        <p className="home-subtitle">What do you want to do today?</p>
        <a className="home-resources-link" href="https://github.com/elalamiimed/HITSZCS" target="_blank" rel="noopener noreferrer">
          Notes &amp; lectures <ArrowUpRight size={16} aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        {userId && profileFailed && <p className="home-note" role="status">Your name could not be loaded. You can still explore the dashboard.</p>}
      </header></div>

      <section className="home-features" aria-label="Explore StudyHive">
        {features.map(({ name: title, description, action, icon: Icon, href }) => {
          const content = (
            <>
              <span className="home-feature-icon"><Icon size={26} aria-hidden="true" /></span>
              <h2>{title}</h2>
              <p>{description}</p>
              <span className="home-feature-action">
                {href ? <>{action} <ArrowRight size={18} aria-hidden="true" /></> : 'Coming soon'}
              </span>
            </>
          );
          const className = 'home-feature' + (title === 'Study Buddy' ? ' home-feature-primary' : '');
          return href ? <a className={className} href={href} key={title}>{content}</a> : <article className={className} key={title}>{content}</article>;
        })}
      </section>

    </div>
  );
}



