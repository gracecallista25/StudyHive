import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Check, ChevronDown, Clock, Clock3, MapPin, Monitor, NotebookPen, Search, X, Tags, GraduationCap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Degree } from '../auth/auth';
import { Badge, Button } from '../../shared/components';
import { majorsByDegree, degreeOptions, maxYearByDegree } from '../auth/auth';
import { StudentAvatar } from '../../shared/components';
import { courses, loadCourses, studyBuddyConnected } from './studyBuddy';
import type { Student, StudentFilters, ListingSearchFilters } from './studyBuddy';


interface CoursePickerProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  allowCustom?: boolean;
}

export function CoursePicker({ value, onChange, required = true, allowCustom = false }: CoursePickerProps) {
  const [query, setQuery] = useState(value);
  const [availableCourses, setAvailableCourses] = useState(courses);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  useEffect(() => { if (studyBuddyConnected) loadCourses().then(setAvailableCourses).catch(() => undefined); }, []);
  const options = availableCourses.filter(course => course.toLowerCase().includes(query.trim().toLowerCase()));

  function chooseCourse(course: string) {
    (document.getElementById('buddy-course') as HTMLInputElement | null)?.setCustomValidity('');
    setQuery(course);
    onChange(course);
    setOpen(false);
    setActive(-1);
  }

  function handleInputChange(nextValue: string) {
    setQuery(nextValue);
    onChange(allowCustom ? nextValue : availableCourses.find(course => course.toLowerCase() === nextValue.trim().toLowerCase()) ?? '');
    setOpen(true);
    setActive(-1);
    (document.getElementById('buddy-course') as HTMLInputElement | null)?.setCustomValidity('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActive(current => event.key === 'ArrowDown' ? Math.min(current + 1, options.length - 1) : Math.max(current - 1, 0));
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
    if (event.key === 'Enter' && open && options.length) {
      event.preventDefault();
      chooseCourse(options[active >= 0 ? active : 0]);
    }
  }

  function clearAndOpen() {
    setQuery('');
    onChange('');
    setActive(-1);
    setOpen(true);
    document.getElementById('buddy-course')?.focus();
  }

  return (
    <div className="buddy-picker" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <label htmlFor="buddy-course">Course</label>
      <div className="buddy-picker-control">
        <input
          id="buddy-course"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="buddy-course-options"
          aria-activedescendant={open && active >= 0 && options[active] ? `buddy-option-${active}` : undefined}
          required={required}
          autoComplete="off"
          placeholder="Search or choose a course"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={event => handleInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="button" aria-label="Show all courses" onClick={clearAndOpen}><ChevronDown size={20} /></button>
      </div>
      {open && (
        <ul id="buddy-course-options" role="listbox" aria-label="Courses">
          {options.map((course, index) => (
            <li id={`buddy-option-${index}`} role="option" aria-selected={index === active} key={course} onMouseDown={event => event.preventDefault()} onClick={() => chooseCourse(course)}>
              {course}
            </li>
          ))}
          {!options.length && <li role="presentation">No courses found. Try another search.</li>}
        </ul>
      )}
    </div>
  );
}
interface Props { filters: StudentFilters; onChange: (filters: StudentFilters) => void; students: Student[] }
function Select({ label, icon: Icon, value, options, onChange }: { label: string; icon: LucideIcon; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return <label className="filter-field"><span>{label}</span><span className="select-wrap"><Icon size={18}/><select value={value} onChange={e => onChange(e.target.value)} aria-label={label}>{options.map(o => <option value={o.value} key={o.value}>{o.label}</option>)}</select><ChevronDown size={15}/></span></label>;
}
const options = (values: string[], all: string) => [{ value: '', label: all }, ...[...new Set(values)].map(value => ({ value, label: value }))];
export function FilterBar({ filters, onChange, students }: Props) {
  const majors = filters.degree ? majorsByDegree[filters.degree] : [...new Set(Object.values(majorsByDegree).flat())].sort();
  const years = Array.from({ length: filters.degree ? maxYearByDegree[filters.degree] : 5 }, (_, index) => index + 1);
  const set = (key: keyof StudentFilters, value: string | boolean) => onChange({ ...filters, [key]: value });
  return <section className="filter-panel" aria-label="Filter students" title="Time ranges use Shenzhen time (UTC+8).">
    <div className="filter-selects">
      <Select label="Course" icon={Search} value={filters.course} options={options(students.map(s => s.course), 'All courses')} onChange={v => set('course', v)}/>
      <Select label="Time" icon={Clock3} value={filters.availability} options={[{ value: '', label: 'Any time' }, ...['09:00-12:00', '13:00-15:00', '15:00-18:00', '18:00-21:00', '21:00-23:00'].map(value => ({ value, label: value.replace('-', '–') }))]} onChange={v => set('availability', v)}/>
      <Select label="Degree" icon={GraduationCap} value={filters.degree} options={[{ value: '', label: 'Any degree' }, ...degreeOptions]} onChange={v => onChange({ ...filters, degree: v as Degree | '', major: '', yearOfStudy: '' })}/>
      <Select label="Year of study" icon={CalendarDays} value={filters.yearOfStudy} options={[{ value: '', label: 'Any year' }, ...years.map(y => ({ value: String(y), label: 'Year ' + y }))]} onChange={v => set('yearOfStudy', v)}/>
      <Select label="Major" icon={BookOpen} value={filters.major} options={options(majors, 'Any major')} onChange={v => set('major', v)}/>
    </div>
    <div className="tonight-filter"><span className="filter-label">Free Tonight</span><button type="button" role="switch" aria-checked={filters.freeTonight} aria-label="Free Tonight" className="toggle" onClick={() => set('freeTonight', !filters.freeTonight)}><span/></button><p>Show students free tonight.<br/><span>Sample availability</span></p></div>
  </section>;
}


interface StudentCardProps {
  portrait: ReactNode;
  name: string;
  major: string;
  degree: string;
  year: number;
  course: string;
  notes: string;
  presence: string;
  mode?: string;
  date?: string;
  time?: string;
  location?: string;
}

export function FocusedStudentCard({
  portrait,
  name,
  major,
  degree,
  year,
  course,
  notes,
  presence,
  mode,
  date,
  time,
  location,
}: StudentCardProps) {
  const facts = [
    { label: 'Course', value: course, icon: BookOpen },
    ...(mode ? [{ label: 'Mode', value: mode, icon: Monitor }] : []),
    ...(date ? [{ label: 'Date', value: date, icon: CalendarDays }] : []),
    ...(time ? [{ label: 'Time', value: time, icon: Clock }] : []),
    ...(location ? [{ label: 'Location', value: location, icon: MapPin }] : []),
  ];
  const degreeLabel = degree === 'bachelor' ? "Bachelor's" : degree === 'master' ? "Master's" : degree;

  return (
    <article className="student-card buddy-card buddy-focused" aria-label="Current student">
      <div className="buddy-person-panel">
        {portrait}
        <h2>{name}</h2>
        <p className="buddy-person-major">{major}</p>
        <p className="buddy-person-degree">{degreeLabel} · Year {year}</p>
        <p className="buddy-presence">{presence}</p>
      </div>
      <div className="buddy-detail-panel">
        <h3>Make progress, together.</h3>
        <dl className="buddy-detail-facts">
          {facts.map(({ label, value, icon: Icon }) => (
            <div key={label}>
              <dt><Icon size={21} strokeWidth={1.5} aria-hidden="true" /><span>{label}</span></dt>
              <dd>{value}</dd>
            </div>
          ))}
          <div className="student-description">
            <dt><NotebookPen size={21} strokeWidth={1.5} aria-hidden="true" /><span>Looking for</span></dt>
            <dd>{notes || 'No additional notes.'}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

const majors = [...new Set(Object.values(majorsByDegree).flat())].sort();

interface ListingSearchFieldsProps {
  filters: ListingSearchFilters;
  onChange: (filters: ListingSearchFilters) => void;
}

export function ListingSearchFields({ filters, onChange }: ListingSearchFieldsProps) {
  function updateFilter(key: keyof ListingSearchFilters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="buddy-search-grid">
      <label>
        Major
        <select aria-label="Major" value={filters.major} onChange={event => updateFilter('major', event.target.value)}>
          <option value="">Any major</option>
          {majors.map(major => <option key={major} value={major}>{major}</option>)}
        </select>
      </label>
      <label>Date<input type="date" value={filters.date} onChange={event => updateFilter('date', event.target.value)} /></label>
      <label>Start time<input type="time" value={filters.start_time} onChange={event => updateFilter('start_time', event.target.value)} /></label>
      <label>End time<input type="time" value={filters.end_time} onChange={event => updateFilter('end_time', event.target.value)} /></label>
      <label className="buddy-search-location">
        Location
        <input type="text" placeholder="Any location, e.g. Library" value={filters.location} onChange={event => updateFilter('location', event.target.value)} />
      </label>
      <p className="buddy-note buddy-search-location">These filters are optional. Enter both times to find sessions that overlap your time range.</p>
    </div>
  );
}

export function StudentCard({ student: s, onView }: { student: Student; onView: () => void }) {
  return <article className="student-card">
    <StudentAvatar variant={s.avatar}/>
    <div className="student-info">
      <div className="student-heading"><h3>{s.name}</h3><span className="course-badge"><BookOpen size={14}/>{s.course}</span></div>
      <p className="student-meta">{s.major}<span>·</span>{s.degree === 'bachelor' ? "Bachelor's" : "Master's"} · Year {s.yearOfStudy}</p>
      <div className="student-description"><p className="description-label">Looking for</p><p>{s.lookingFor}</p></div>
      <div className="student-tags"><Tags size={16}/><div>{s.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}</div></div>
    </div>
    <div className="card-bottom"><blockquote>“{s.quote}”</blockquote><Button onClick={onView}>View profile <ArrowRight size={17}/></Button></div>
  </article>;
}

export function StudentProfileModal({ student: s, sent, onSend, onClose }: { student: Student; sent: boolean; onSend: () => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    el.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { el.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog ref={dialog} className="profile-modal" aria-labelledby="profile-title" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === dialog.current) { const rect = dialog.current.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) onClose(); } }}>
    <div className="modal-top"><span className="eyebrow">MEET YOUR STUDY BUDDY</span><button className="icon-button" aria-label="Close profile" onClick={onClose} autoFocus><X size={22}/></button></div>
    <div className="modal-person"><StudentAvatar variant={s.avatar}/><div><h2 id="profile-title">{s.name}</h2><p>{s.major} · {s.degree === 'bachelor' ? "Bachelor's" : "Master's"} · Year {s.yearOfStudy}</p><span className="course-badge"><BookOpen size={14}/>{s.course}</span></div></div>
    <p className="modal-bio">{s.bio}</p>
    <div className="modal-facts"><div><h3>Looking for</h3><p>{s.lookingFor}</p></div></div>
    <div className="modal-goal"><h3>What I’m working on</h3><p>{s.studyGoal}</p><p className="place"><MapPin size={16}/>{s.preferredPlace}</p></div>
    <div className="flex flex-wrap gap-2">{s.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}</div>
    <blockquote className="modal-quote">“{s.quote}”</blockquote>
    <div className="modal-action"><Button onClick={onSend} disabled={sent}>{sent ? <><Check size={18}/>Request sent</> : <>Send Study Request<ArrowUpRight size={18}/></>}</Button><p role="status" aria-live="polite">{sent ? 'Study request sent. This is a local demo; no one has been contacted.' : 'Fictional profile · Requests are demo-only and reset on refresh.'}</p></div>
  </dialog>;
}



