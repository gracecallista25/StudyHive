import { useState } from 'react';
import { ArrowRight, SearchX } from 'lucide-react';
import type { Student, StudentFilters } from './studentTypes';
import { students } from './students';
import { AcademicArt } from '../../shared/components/Artwork';
import { FilterBar } from './FilterBar';
import { StudentCard } from './StudentCard';
import { StudentProfileModal } from './StudentProfileModal';
import { Button } from '../../shared/components/Button';
const emptyFilters: StudentFilters = { course: '', availability: '', yearOfStudy: '', major: '', freeTonight: false };
export function StudyBuddyPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const [selected, setSelected] = useState<Student | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  // Local display filtering of four fixtures, not matching or backend availability logic.
  const visible = students.filter(s =>
    (!filters.course || s.course === filters.course) &&
    (!filters.availability || s.availability.some(a => a === filters.availability)) &&
    (!filters.yearOfStudy || String(s.yearOfStudy) === filters.yearOfStudy) &&
    (!filters.major || s.major === filters.major) &&
    (!filters.freeTonight || s.freeTonight));
  const filtered = Object.values(filters).some(Boolean);
  return <div className="page-content">
    <header className="hero"><div className="hero-copy"><p className="breadcrumb">Campus <span>/</span><strong>Study Buddy</strong></p><h1>Find your people.</h1><p className="hero-subtitle">A good study session starts with the right company.</p></div><AcademicArt/></header>
    <FilterBar filters={filters} onChange={setFilters} students={students}/>
    <section className="profiles-section" aria-labelledby="profiles-title">
      <div className="results-heading"><h2 id="profiles-title">Sample profiles</h2><div className="results-actions">{filtered && <button className="reset-link" onClick={() => setFilters(emptyFilters)}>Reset filters</button>}<p role="status" aria-live="polite">{visible.length} {visible.length === 1 ? 'student' : 'students'} found</p></div></div>
      {visible.length ? <div className="student-grid">{visible.map(s => <StudentCard key={s.id} student={s} onView={() => setSelected(s)}/>)}</div> : <div className="empty-state"><SearchX size={34}/><h3>No study buddies found just yet.</h3><p>Try another course or loosen a filter to find your people.</p><Button onClick={() => setFilters(emptyFilters)}>Show all students <ArrowRight size={17}/></Button></div>}
    </section>
    <footer className="page-footer"><div className="footer-campus"><strong>HITSZ</strong><span>A CAMPUS OF CURIOUS MINDS.<br/>A LITTLE BETTER, TOGETHER.</span><i/></div><p>Keep learning.<br/><span>Keep growing.</span></p></footer>
    {selected && <StudentProfileModal key={selected.id} student={selected} sent={sentIds.has(selected.id)} onSend={() => setSentIds(current => new Set(current).add(selected.id))} onClose={() => setSelected(null)}/>}
  </div>;
}
