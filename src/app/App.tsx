import { useEffect, useState } from 'react';
import { AuthLayout } from '../shared/layout/AuthLayout';
import { AppLayout } from '../shared/layout/AppLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { HomePage } from '../features/home/HomePage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { ConnectedStudyBuddy } from '../features/study-buddy/ConnectedStudyBuddy';
import { StudyBuddyPage } from '../features/study-buddy/StudyBuddyPage';
import { studyBuddyConnected } from '../features/study-buddy/studyBuddyApi';
import { StudyGroupsPage } from '../features/study-groups/StudyGroupsPage';

import { NotificationsPage } from '../features/notifications/NotificationsPage';

import { ProjectsPage } from '../features/projects/ProjectsPage';

type Page = 'projects' | 'notifications' | 'home' | 'groups' | 'profile' | 'register' | 'demo' | 'login';

function getCurrentPage(): Page {
  switch (window.location.hash) {
    case '#projects': return 'projects';
    case '#notifications': return 'notifications';
    case '#study-groups': return 'groups';
    case '#home': return 'home';
    case '#profile': return 'profile';
    case '#register': return 'register';
    case '#study-buddy': return 'demo';
    default: return 'login';
  }
}

function getDocumentTitle(page: Page) {
  const titles: Record<Page, string> = {
    projects: 'Projects',
    notifications: 'Notifications',
    groups: 'Study Groups',
    home: 'Home',
    profile: 'My Profile',
    demo: 'Study Buddy',
    register: 'Create account',
    login: 'Log in',
  };
  return titles[page] + ' · StudyHive';
}

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [page, setPage] = useState<Page>(getCurrentPage);

  useEffect(() => {
    function handleNavigation() {
      setPage(getCurrentPage());
      window.scrollTo(0, 0);
    }
    window.addEventListener('hashchange', handleNavigation);
    return () => window.removeEventListener('hashchange', handleNavigation);
  }, []);

  useEffect(() => {
    document.title = getDocumentTitle(page);
  }, [page]);

  if (page === 'home') return <main id="main-content" tabIndex={-1}><HomePage userId={userId} /></main>;
  if (page === 'projects') return <AppLayout active="projects"><ProjectsPage /></AppLayout>;
  if (page === 'notifications') return <AppLayout active="notifications"><NotificationsPage /></AppLayout>;
  if (page === 'groups') return <AppLayout active="groups"><StudyGroupsPage userId={userId} /></AppLayout>;
  if (page === 'profile') return <AppLayout active="profile"><ProfilePage userId={userId} /></AppLayout>;
  if (page === 'demo') {
    return <AppLayout>{studyBuddyConnected ? <ConnectedStudyBuddy userId={userId} /> : <><div className="demo-banner"><span>Study Buddy demo · Fictional profiles</span><a href="#login">Back to login</a></div><StudyBuddyPage /></>}</AppLayout>;
  }

  return (
    <AuthLayout register={page === 'register'}>
      {page === 'register' ? <RegisterPage /> : <LoginPage onLogin={id => { setUserId(id); if (id) window.location.hash = 'home'; }} />}
    </AuthLayout>
  );
}
