import { useEffect, useState } from 'react';
import { AppLayout } from './ui/layout/AppLayout';
import { AuthLayout } from './ui/layout/AuthLayout';
import { StudyBuddyPage } from './ui/pages/StudyBuddyPage';
import { LoginPage } from './ui/pages/LoginPage';
import { RegisterPage } from './ui/pages/RegisterPage';
function currentPage() {
  if (window.location.hash === '#register') return 'register';
  if (window.location.hash === '#study-buddy') return 'demo';
  return 'login';
}
export default function App() {
  const [page, setPage] = useState(currentPage);
  useEffect(() => {
    const navigate = () => { setPage(currentPage()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  useEffect(() => {
    document.title = (page === 'demo' ? 'Study Buddy' : page === 'register' ? 'Create account' : 'Log in') + ' · StudyHive';
  }, [page]);
  if (page === 'demo') return <AppLayout><div className="demo-banner"><span>Study Buddy demo · Fictional profiles</span><a href="#login">Back to login</a></div><StudyBuddyPage /></AppLayout>;
  return <AuthLayout register={page === 'register'}>{page === 'register' ? <RegisterPage/> : <LoginPage/>}</AuthLayout>;
}
