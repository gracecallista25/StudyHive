import { useEffect, useState } from 'react';
import { AuthLayout, AppLayout } from './shared/layout';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { HomePage } from './features/home/HomePage';
import { ProfilePage } from './features/profile/ProfilePage';
import { ConnectedStudyBuddy } from './features/study-buddy/ConnectedStudyBuddy';
import { StudyBuddyPage } from './features/study-buddy/StudyBuddyPage';
import { studyBuddyConnected } from './features/study-buddy/studyBuddy';
import { StudyGroupsPage } from './features/study-groups/StudyGroupsPage';
import { NotificationsPage } from './features/notifications/NotificationsPage';
import { ProjectsPage } from './features/projects/ProjectsPage';
import { AskSeniorPage } from './features/ask-senior/AskSeniorPage';
import { MessagesPage } from './features/messages/MessagesPage';

type Page = 'login' | 'register' | 'home' | 'study-buddy' | 'study-groups' | 'projects' | 'ask-senior' | 'messages' | 'notifications' | 'profile';

function getCurrentPage(): Page {
  switch (window.location.hash) {
    case '#register': return 'register';
    case '#home': return 'home';
    case '#study-buddy': return 'study-buddy';
    case '#study-groups': return 'study-groups';
    case '#projects': return 'projects';
    case '#ask-senior': return 'ask-senior';
    case '#messages': return 'messages';
    case '#notifications': return 'notifications';
    case '#profile': return 'profile';
    default: return 'login';
  }
}

const pageTitles: Record<Page, string> = { login: 'Log in', register: 'Create account', home: 'Home', 'study-buddy': 'Study Buddy', 'study-groups': 'Study Groups', projects: 'Projects', 'ask-senior': 'Ask a Senior', messages: 'Messages', notifications: 'Notifications', profile: 'My Profile' };

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [page, setPage] = useState<Page>(getCurrentPage);

  useEffect(() => {
    const handleNavigation = () => { setPage(getCurrentPage()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', handleNavigation);
    return () => window.removeEventListener('hashchange', handleNavigation);
  }, []);

  useEffect(() => { document.title = `${pageTitles[page]} · StudyHive`; }, [page]);

  if (page === 'home') return <main id="main-content" tabIndex={-1}><HomePage userId={userId} /></main>;
  if (page === 'login' || page === 'register') return <AuthLayout register={page === 'register'}>{page === 'register' ? <RegisterPage /> : <LoginPage onLogin={id => { setUserId(id); if (id) window.location.hash = 'home'; }} />}</AuthLayout>;

  const content = {
    'study-buddy': studyBuddyConnected ? <ConnectedStudyBuddy userId={userId} /> : <><div className="demo-banner"><span>Study Buddy demo · Fictional profiles</span><a href="#login">Back to login</a></div><StudyBuddyPage /></>,
    'study-groups': <StudyGroupsPage userId={userId} />,
    projects: <ProjectsPage userId={userId} />,
    'ask-senior': <AskSeniorPage userId={userId} />,
    messages: <MessagesPage userId={userId} />,
    notifications: <NotificationsPage userId={userId} />,
    profile: <ProfilePage userId={userId} />,
  }[page];
  return <AppLayout active={page}>{content}</AppLayout>;
}

export default App;

