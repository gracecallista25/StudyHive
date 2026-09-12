import { useRef, useState } from 'react';
import { GraduationCap, Search, UsersRound } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { AcademicArt } from '../../shared/components/Artwork';
import { SeniorCard } from './SeniorCard';
import { SeniorProfile } from './SeniorProfile';
import { SeniorApplicationForm } from './SeniorApplicationForm';
import type { SeniorApplication } from './SeniorApplicationForm';
import { seniors } from './seniorData';
import type { SeniorQuestion } from './seniorData';
import './askSenior.css';

const courses = [...new Set(seniors.flatMap(senior => senior.courses))].sort();
const majors = [...new Set(seniors.map(senior => senior.major))].sort();

export function AskSeniorPage() {
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

  const selected = seniors.find(senior => senior.id === selectedId);
  const visibleSeniors = seniors.filter(senior => {
    const searchableText = [senior.name, senior.major, senior.summary, ...senior.tags, ...senior.topics.map(topic => topic.title)].join(' ').toLowerCase();
    return searchableText.includes(search.trim().toLowerCase())
      && (!course || senior.courses.includes(course))
      && (!major || senior.major === major)
      && (!availableOnly || senior.available);
  });

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

  function saveQuestion(question: SeniorQuestion) {
    if (!selected) return;
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
      <p className="senior-preview-note">Interactive preview · Fictional profiles. Questions and applications reset when you leave Ask a Senior.</p>
      {showApplication ? (
        <SeniorApplicationForm application={application} onSave={setApplication} onBack={backToSeniors} />
      ) : selected ? (
        <SeniorProfile key={selected.id} senior={selected} focusQuestion={focusQuestion} savedQuestion={questions[selected.id]} onBack={backToSeniors} onSave={saveQuestion} onEdit={editQuestion} />
      ) : (
        <>
          <header className="seniors-header">
            <div><h1>A little guidance.<br />A clearer path.</h1><p>Learn from students who have been where you are.</p></div>
            <div className="senior-header-action">
              <AcademicArt />
              <Button onClick={openApplication}><GraduationCap size={19} aria-hidden="true" />{application ? 'View your application' : 'Become a senior'}</Button>
            </div>
          </header>
          <div className="seniors-filters" role="search" aria-label="Find a senior">
            <div className="senior-search"><Search size={20} aria-hidden="true" /><input type="search" aria-label="Search seniors" placeholder="Search seniors by name, topic or keyword…" value={search} onChange={event => setSearch(event.target.value)} /></div>
            <label>Course<select aria-label="Course" value={course} onChange={event => setCourse(event.target.value)}><option value="">All courses</option>{courses.map(item => <option key={item}>{item}</option>)}</select></label>
            <label>Major<select aria-label="Major" value={major} onChange={event => setMajor(event.target.value)}><option value="">All majors</option>{majors.map(item => <option key={item}>{item}</option>)}</select></label>
            <label className="senior-available-filter">Available to help<span><input type="checkbox" checked={availableOnly} onChange={event => setAvailableOnly(event.target.checked)} /><span className="senior-switch" aria-hidden="true" /><span>Show only available</span></span></label>
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
