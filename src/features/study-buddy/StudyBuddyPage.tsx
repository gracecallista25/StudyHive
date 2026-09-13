import { useState } from 'react';
import { ArrowLeft, ArrowRight, SearchX } from 'lucide-react';
import { AcademicArt } from '../../shared/components';
import { Button } from '../../shared/components';
import { CoursePicker, FocusedStudentCard } from './StudyBuddyComponents';
import { StudentAvatar } from '../../shared/components';
import { matchStudents } from './studyBuddy';
import type { StudyMode } from './studyBuddy';
import './studyBuddy.css';

export function StudyBuddyPage({ initialCourse = '' }: { initialCourse?: string }) {
  const [course, setCourse] = useState(initialCourse);
  const [mode, setMode] = useState<StudyMode>('Either');
  const [searching, setSearching] = useState(!initialCourse);
  const [courseOnly, setCourseOnly] = useState(false);
  const [index, setIndex] = useState(0);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const matches = matchStudents(course, mode, courseOnly);
  const student = matches[index];
  const available = matches.filter(person => person.availableToStudy).length;

  function editSearch() {
    setSearching(true);
    setIndex(0);
    setCourseOnly(false);
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!course) {
      const input = event.currentTarget.querySelector<HTMLInputElement>('#buddy-course');
      input?.setCustomValidity('Choose a course from the list.');
      input?.reportValidity();
      return;
    }
    setIndex(0);
    setCourseOnly(false);
    setSearching(false);
  }

  function moveBack() {
    setIndex(current => current - 1);
  }

  function moveNext() {
    setIndex(current => current + 1);
  }

  function sendStudyRequest() {
    if (student) setSentIds(current => new Set(current).add(student.id));
  }

  function showCourseStudents() {
    setCourseOnly(true);
    setIndex(0);
  }

  return (
    <div className="page-content buddy-page">
      <header className="hero">
        <div className="hero-copy">
          <p className="breadcrumb">Campus <span>/</span><strong>Study Buddy</strong></p>
          <h1>Find a Study Buddy</h1>
          <p className="hero-subtitle">{searching ? 'What are you studying today?' : 'A good study session starts with the right company.'}</p>
        </div>
        <AcademicArt />
      </header>

      {searching ? (
        <form className="buddy-start" onSubmit={handleSearch}>
          <CoursePicker value={course} onChange={setCourse} />
          <fieldset className="buddy-modes">
            <legend>Study Mode</legend>
            {(['Online', 'In person', 'Either'] as const).map(value => (
              <label key={value}>
                <input type="radio" name="study-mode" value={value} checked={mode === value} onChange={() => setMode(value)} />
                {value}
              </label>
            ))}
          </fieldset>
          <Button type="submit">Find Study Buddies <ArrowRight size={17} /></Button>
        </form>
      ) : (
        <section aria-label="Study buddy results">
          <div className="buddy-selection">
            <div><span>Studying:</span><strong>{course}</strong></div>
            <div><span>Mode:</span><strong>{courseOnly ? 'Any mode (course only)' : mode}</strong></div>
            <button className="reset-link" onClick={editSearch}>Change</button>
          </div>
          <p className="buddy-count">{available} {available === 1 ? 'student' : 'students'} available to study · {matches.length} {matches.length === 1 ? 'match' : 'matches'}</p>

          {student ? (
            <>
              <FocusedStudentCard
                portrait={<StudentAvatar variant={student.avatar} />}
                name={student.name}
                major={student.major}
                degree={student.degree}
                year={student.yearOfStudy}
                course={student.course}
                notes={student.lookingFor}
                mode={student.studyMode}
                presence={`${student.online ? 'Online now' : 'Currently offline'} · ${student.availableToStudy ? 'Available to study' : 'Not currently looking for a buddy'}`}
              />
              <p className="buddy-position" aria-live="polite">Student {index + 1} of {matches.length}: {student.name}</p>
              <div className="buddy-actions">
                <Button disabled={index === 0} onClick={moveBack}><ArrowLeft size={16} />Back</Button>
                <Button disabled={sentIds.has(student.id)} onClick={sendStudyRequest}>{sentIds.has(student.id) ? 'Request sent' : 'Study Together'}</Button>
                <Button disabled={index === matches.length - 1} onClick={moveNext}>Next<ArrowRight size={16} /></Button>
              </div>
              <p className="buddy-feedback" role="status">{sentIds.has(student.id) ? `Study request sent to ${student.name}.` : ''}</p>
              <p className="buddy-note">Demo only: no request is delivered. Online means active on StudyHive; availability means looking for a study buddy.</p>
            </>
          ) : (
            <div className="empty-state">
              <SearchX size={32} />
              <h2>No study buddies found right now.</h2>
              <div className="buddy-actions">
                <Button onClick={editSearch}>Change Course</Button>
                <Button onClick={showCourseStudents}>Show Students From This Course</Button>
              </div>
            </div>
          )}
        </section>
      )}

      <footer className="page-footer">
        <div className="footer-campus"><strong>HITSZ</strong><span>A CAMPUS OF CURIOUS MINDS.<br />A LITTLE BETTER, TOGETHER.</span><i /></div>
        <p>Keep learning.<br /><span>Keep growing.</span></p>
      </footer>
    </div>
  );
}



