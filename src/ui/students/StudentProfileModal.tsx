import { useEffect, useRef } from 'react';
import { X, ArrowUpRight, Check, MapPin, BookOpen } from 'lucide-react';
import type { Student } from '../../types/student';
import { StudentAvatar } from '../components/StudentAvatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
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
    <div className="modal-person"><StudentAvatar variant={s.avatar}/><div><h2 id="profile-title">{s.name}</h2><p>{s.major} · Year {s.yearOfStudy}</p><span className="course-badge"><BookOpen size={14}/>{s.course}</span></div></div>
    <p className="modal-bio">{s.bio}</p>
    <div className="modal-facts"><div><h3>Looking for</h3><p>{s.lookingFor}</p></div></div>
    <div className="modal-goal"><h3>What I’m working on</h3><p>{s.studyGoal}</p><p className="place"><MapPin size={16}/>{s.preferredPlace}</p></div>
    <div className="flex flex-wrap gap-2">{s.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}</div>
    <blockquote className="modal-quote">“{s.quote}”</blockquote>
    <div className="modal-action"><Button onClick={onSend} disabled={sent}>{sent ? <><Check size={18}/>Request sent</> : <>Send Study Request<ArrowUpRight size={18}/></>}</Button><p role="status" aria-live="polite">{sent ? 'Study request sent. This is a local demo; no one has been contacted.' : 'Fictional profile · Requests are demo-only and reset on refresh.'}</p></div>
  </dialog>;
}
