import { ArrowRight, BookOpen, Clock3, UsersRound, Tags } from 'lucide-react';
import type { Student } from '../../types/student';
import { StudentAvatar } from '../components/StudentAvatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
export function StudentCard({ student: s, onView }: { student: Student; onView: () => void }) {
  return <article className="student-card">
    <StudentAvatar variant={s.avatar}/>
    <div className="student-info">
      <div className="student-heading"><h3>{s.name}</h3><span className="course-badge"><BookOpen size={14}/>{s.course}</span></div>
      <p className="student-meta">{s.major}<span>·</span>{s.entryYear}</p>
      <dl className="student-details"><div><dt><Clock3 size={16}/><span>Usually available</span></dt><dd>{s.availabilityLabel}</dd></div><div><dt><UsersRound size={16}/><span>Study style</span></dt><dd>{s.studyStyleLabel}</dd></div></dl>
      <div className="student-tags"><Tags size={16}/><div>{s.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}</div></div>
    </div>
    <div className="card-bottom"><blockquote>“{s.quote}”</blockquote><Button onClick={onView}>View profile <ArrowRight size={17}/></Button></div>
  </article>;
}
