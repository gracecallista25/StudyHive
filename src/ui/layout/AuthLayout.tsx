import type { ReactNode } from 'react';
import { ArrowUpRight, BookOpen, UsersRound, Sparkles } from 'lucide-react';
import { AcademicArt, CampusArt, LeafMark } from '../components/Artwork';
import { StudentAvatar } from '../components/StudentAvatar';
export function AuthLayout({ children, register = false }: { children: ReactNode; register?: boolean }) {
  return <div className={'auth-shell' + (register ? ' auth-register' : '')}>
    <aside className="auth-story" aria-label="Welcome to StudyHive">
      <a className="brand auth-brand" href="#login" aria-label="StudyHive login"><LeafMark/><div><span className="brand-name">StudyHive</span><p>HITSZ · Shenzhen</p></div></a>
      <div className="auth-story-content">
        <p className="auth-campus-label"><span/>A LITTLE CLOSER, ON CAMPUS</p>
        <h1>{register ? <>A new chapter.<br/>Better together.</> : <>Your people.<br/>Your next chapter.</>}</h1>
        <p className="auth-story-description">Find a study partner, share a little curiosity,<br className="desktop-break"/> and make campus feel a little more like home.</p>
        <div className="auth-art-wrap"><AcademicArt/></div>
        <div className="auth-story-notes"><span><BookOpen size={17}/>Learn together</span><span><UsersRound size={17}/>Find your people</span><span><Sparkles size={17}/>Grow together</span></div>
      </div>
      <div className="auth-story-bottom"><p>Same campus.<br/>Brighter together.</p><CampusArt/></div>
    </aside>
    <main className="auth-main">
      <div className="auth-topline"><span>{register ? 'Already part of the hive?' : 'New to StudyHive?'}</span><a href={register ? '#login' : '#register'}>{register ? 'Log in' : 'Create an account'}<ArrowUpRight size={16}/></a></div>
      <div className="auth-content">{children}</div>
      <footer className="auth-footer"><div className="auth-avatar-stack"><StudentAvatar variant="lin"/><StudentAvatar variant="maya"/><StudentAvatar variant="yuna"/></div><p>A place for curious minds.<br/><strong>Made for HITSZ students.</strong></p><a href="#study-buddy">Explore demo<ArrowUpRight size={15}/></a></footer>
    </main>
  </div>;
}
