import { ArrowRight, BookOpen, Tags } from 'lucide-react';
import type { Student } from './studentTypes';
import { StudentAvatar } from './StudentAvatar';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
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
