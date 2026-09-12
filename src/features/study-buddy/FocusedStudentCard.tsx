import type { ReactNode } from 'react';
import { BookOpen, CalendarDays, Clock, MapPin, Monitor, NotebookPen } from 'lucide-react';

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
