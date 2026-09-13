import { useEffect, useRef, useState } from 'react';
import { GraduationCap, Search, UsersRound } from 'lucide-react';
import { Button } from '../../shared/components';
import { majorsByDegree } from '../auth/auth';

import { SeniorApplicationForm, SeniorCard, SeniorProfile } from './SeniorComponents';
import type { SeniorApplication } from './seniors';
import { seniorMatchesFilters, seniors as sampleSeniors, seniorsConnected, loadSeniors, publishSenior, seniorApplication, sendSeniorQuestion, updateSeniorAvailability } from './seniors';
import type { Senior } from './seniors';
import type { SeniorQuestion } from './seniors';
import './askSenior.css';

export function AskSeniorPage({ userId }: { userId: string | null }) {
  const [seniors, setSeniors] = useState<Senior[]>(seniorsConnected ? [] : sampleSeniors);
  const [loading, setLoading] = useState(seniorsConnected);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [availabilityPending, setAvailabilityPending] = useState(false);
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('');
  const [major, setMajor] = useState('');
  const [availableOnly, setAvailableOnly] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusQuestion, setFocusQuestion] = useState(false);
  const [questions, setQuestions] = useState<Record<string, SeniorQuestion>>({});
  const [showApplication, setShowApplication] = useState(false);
  const [application, setApplication] = useState<SeniorApplication | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const seniorCourses = [...new Set(seniors.flatMap(senior => senior.courses))].sort();
  const seniorMajors = [...new Set([...majorsByDegree.bachelor, ...majorsByDegree.master, ...seniors.map(senior => senior.major)])].sort();
  const ownProfile = seniors.find(senior => senior.id === userId);

  useEffect(() => {
    if (!seniorsConnected) return;
    let active = true;
    setLoading(true);
    setError('');
    loadSeniors()
      .then(profiles => {
        if (!active) return;
        setSeniors(profiles);
        const own = profiles.find(profile => profile.id === userId);
        setApplication(own ? seniorApplication(own) : null);
      })
      .catch(() => { if (active) setError('Senior profiles could not be loaded. Please try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId, attempt]);

  async function saveApplication(details: SeniorApplication) {
    if (!seniorsConnected) { setApplication(details); return; }
    if (!userId) throw new Error('Log in to become a senior.');
    const saved = await publishSenior(userId, details);
    setSeniors(items => [...items.filter(item => item.id !== saved.id), saved]);
    setApplication(seniorApplication(saved));
  }

  async function toggleAvailability() {
    if (!userId || !ownProfile || availabilityPending) return;
    setAvailabilityPending(true);
    try {
      const saved = await updateSeniorAvailability(userId, !ownProfile.available);
      setSeniors(items => items.map(item => item.id === saved.id ? saved : item));
    } catch { setError('Your availability could not be updated. Please try again.'); }
    finally { setAvailabilityPending(false); }
  }

  const selected = seniors.find(senior => senior.id === selectedId);
  const visibleSeniors = seniors.filter(senior => seniorMatchesFilters(senior, search, course, major, availableOnly));

  function openSenior(id: string, ask = false) {
    setSelectedId(id);
    setFocusQuestion(ask);
    pageRef.current?.focus();
    window.scrollTo(0, 0);
  }

  function backToSeniors() {
    setSelectedId(null);
    setShowApplication(false);
    pageRef.current?.focus();
    window.scrollTo(0, 0);
  }

  function openApplication() {
    setShowApplication(true);
    pageRef.current?.focus();
    window.scrollTo(0, 0);
  }

  function clearFilters() {
    setSearch('');
    setCourse('');
    setMajor('');
    setAvailableOnly(true);
  }

  async function saveQuestion(question: SeniorQuestion) {
    if (!selected) return;
    if (seniorsConnected) {
      if (!userId) throw new Error('Log in to ask a question.');
      if (selected.id === userId) throw new Error('You cannot ask yourself a question.');
      await sendSeniorQuestion(selected.id, userId, question);
    }
    setQuestions(previous => ({ ...previous, [selected.id]: question }));
  }

  function editQuestion() {
    if (!selected) return;
    setQuestions(previous => {
      const updated = { ...previous };
      delete updated[selected.id];
      return updated;
    });
  }

  return (
    <div className="page-content ask-senior-page" ref={pageRef} tabIndex={-1}>
      <p className="breadcrumb">{selected || showApplication ? 'Ask a Senior' : 'Campus'}<span>/</span><strong>{showApplication ? 'Become a senior' : selected?.name ?? 'Ask a Senior'}</strong></p>
      {!seniorsConnected && <p className="senior-preview-note">Interactive preview · Fictional profiles. Questions and applications reset when you leave Ask a Senior.</p>}
      {loading && <p role="status">Loading seniors...</p>}
      {error && <p role="alert">{error} <button onClick={() => setAttempt(value => value + 1)}>Try again</button></p>}
      {ownProfile && <Button disabled={availabilityPending} onClick={() => void toggleAvailability()}>{ownProfile.available ? 'Pause my availability' : 'Make me available'}</Button>}
      {showApplication ? (
        <SeniorApplicationForm application={application} onSave={saveApplication} onBack={backToSeniors} />
      ) : selected ? (
        <SeniorProfile key={selected.id} senior={selected} focusQuestion={focusQuestion} savedQuestion={questions[selected.id]} onBack={backToSeniors} onSave={saveQuestion} onEdit={editQuestion} />
      ) : (
        <>
          <header className="seniors-header">
            <div><h1>A little guidance.<br />A clearer path.</h1><p>Learn from students who have been where you are.</p></div>
            <div className="senior-header-action">

              <Button onClick={openApplication}><GraduationCap size={19} aria-hidden="true" />{application ? 'View your application' : 'Become a senior'}</Button>
            </div>
          </header>
          <div className="seniors-filters" role="search" aria-label="Find a senior">
            <div className="senior-search"><Search size={20} aria-hidden="true" /><input type="search" aria-label="Search seniors" placeholder="Search seniors by name, topic or keyword…" value={search} onChange={event => setSearch(event.target.value)} /></div>
            <label><select aria-label="Course" value={course} onChange={event => setCourse(event.target.value)}><option value="">All courses</option>{seniorCourses.map(item => <option key={item}>{item}</option>)}</select></label>
            <label><select aria-label="Major" value={major} onChange={event => setMajor(event.target.value)}><option value="">All majors</option>{seniorMajors.map(item => <option key={item}>{item}</option>)}</select></label>
            <label className="senior-available-filter"><span><input type="checkbox" checked={availableOnly} onChange={event => setAvailableOnly(event.target.checked)} /><span className="senior-switch" aria-hidden="true" /><span>Available to help</span></span></label>
          </div>
          <div className="seniors-results-heading">
            <div><h2>Meet your campus guides</h2><p role="status">{visibleSeniors.length} {visibleSeniors.length === 1 ? 'senior' : 'seniors'} {availableOnly ? 'ready to help' : 'found'}.</p></div>
            {(search || course || major || !availableOnly) && <button className="senior-text-button" onClick={clearFilters}>Clear filters</button>}
          </div>
          <div className="seniors-grid">
            {visibleSeniors.map(senior => <SeniorCard key={senior.id} senior={senior} onView={() => openSenior(senior.id)} onAsk={() => openSenior(senior.id, true)} />)}
          </div>
          {visibleSeniors.length === 0 && <div className="seniors-empty"><UsersRound size={36} aria-hidden="true" /><h2>No seniors found.</h2><p>Try another course, major, or search term.</p><Button onClick={clearFilters}>Clear filters</Button></div>}
        </>
      )}
      <footer className="seniors-footer">Same campus. <em>Brighter together.</em></footer>
    </div>
  );
}


