import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../shared/components/Button';
import { ListingSearchFields } from '../study-buddy/ListingSearchFields';
import { GroupCard } from './GroupCard';
import { browseGroups, createGroup, joinGroup, refreshGroup, cancelGroup } from './groupApi';
import type { StudyGroup } from './groupApi';
import '../study-buddy/studyBuddy.css';
import './groups.css';
const empty = { major: '', date: '', start_time: '', end_time: '', location: '' };
export function StudyGroupsPage({ userId }: { userId: string | null }) {
  const [course, setCourse] = useState('');
  const [filters, setFilters] = useState(empty);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [screen, setScreen] = useState<'search' | 'create'>('search');
  const [searched, setSearched] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  async function run(action: () => Promise<void>) { setPending(true); setError(''); setFeedback(''); try { await action(); } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); } finally { setPending(false); } }
  function search(event: FormEvent) {
    event.preventDefault();
    if (Boolean(filters.start_time) !== Boolean(filters.end_time) || (filters.start_time && filters.start_time >= filters.end_time)) { setError('Enter both times, with end time after start time, or leave both empty.'); return; }
    void run(async () => { const result = await browseGroups({ course, ...filters }, userId); setGroups(result); setSearched(true); });
  }
  function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!userId) return;
    const form = new FormData(event.currentTarget); const field = (key: string) => String(form.get(key) ?? '').trim();
    const max = Number(field('max_members'));
    if (!field('course') || !field('location') || field('start_time') >= field('end_time') || !Number.isInteger(max) || max < 2) { setError('Check your course, location, time range, and capacity (at least 2).'); return; }
    void run(async () => { const group = await createGroup({ user_id: userId, course: field('course'), date: field('date'), start_time: field('start_time'), end_time: field('end_time'), location: field('location'), notes: field('notes'), max_members: max }); setGroups([group]); setSearched(true); setScreen('search'); setFeedback('Study room created. You are its first member.'); });
  }
  return <div className="page-content buddy-page groups-page"><header><p className="breadcrumb">Campus <span>/</span><strong>Study Groups</strong></p><h1>A little company.<br/>A lot of progress.</h1><p className="group-subtitle">Find a study room, bring your questions, and learn together.</p></header>
    <div className="group-toolbar"><h2>{screen === 'create' ? 'Create a study room' : 'Find your study room'}</h2>{screen === 'search' && <Button disabled={pending} onClick={() => { setScreen('create'); setError(''); setFeedback(''); }}>Create a room</Button>}</div>
    {error && <p role="alert" className="group-error">{error}</p>}{feedback && <p role="status" className="group-feedback">{feedback}</p>}
    {screen === 'search' ? <details className="group-search-details" open={!searched}><summary>Search filters</summary><form className="group-form" onSubmit={search}><fieldset disabled={pending}><label>Course<input value={course} onChange={e => setCourse(e.target.value)} placeholder="Any course or topic"/></label><ListingSearchFields filters={filters} onChange={setFilters}/><div className="group-card-actions"><Button type="submit">{pending ? 'Loading…' : 'Find rooms'}</Button><button type="button" className="reset-link" onClick={() => { setFilters(empty); setCourse(''); }}>Clear filters</button></div></fieldset></form></details> : <form className="group-form" onSubmit={publish}>{!userId ? <p><a href="#login">Log in</a> to create a study room.</p> : <fieldset disabled={pending}><div className="buddy-search-grid"><label>Course or topic<input name="course" required defaultValue={course}/></label><label>Maximum members<input name="max_members" type="number" min="2" step="1" defaultValue="4" required/><small>Includes you. Set the capacity before publishing.</small></label><label>Date<input name="date" type="date" required/></label><label>Location<input name="location" required placeholder="Library, room 302"/></label><label>Start time<input name="start_time" type="time" required/></label><label>End time<input name="end_time" type="time" required/></label><label className="buddy-search-location">Notes (optional)<textarea name="notes" rows={3} placeholder="What will your group work on?"/></label></div><Button type="submit">{pending ? 'Creating…' : 'Publish room'}</Button></fieldset>}<button type="button" className="reset-link" disabled={pending} onClick={() => { setScreen('search'); setError(''); }}>Back to rooms</button></form>}
    {screen === 'search' && searched && <section aria-label="Study rooms" aria-busy={pending}><p className="group-result-count">{groups.length} {groups.length === 1 ? 'room' : 'rooms'}</p>{!groups.length && <div className="group-empty"><h2>No rooms found yet.</h2><p>Try fewer filters, or create a room and invite others to request a seat.</p></div>}<div className="group-grid">{groups.map(group => <GroupCard key={group.id} group={group} userId={userId} pending={pending} sent={sent.includes(group.id)} onJoin={() => void run(async () => { if (!userId) return; await joinGroup(group.id, userId); setSent(previous => [...previous, group.id]); setFeedback('Join request sent. The host must accept it before you become a member.'); })} onRefresh={() => void run(async () => { const updated = await refreshGroup(group.id); setGroups(previous => previous.map(item => item.id === updated.id ? updated : item)); setFeedback('Room updated.'); })} onCancel={() => { if (window.confirm('Cancel this study room? It will no longer accept requests.')) void run(async () => { if (!userId) return; await cancelGroup(group.id, userId); setGroups(previous => previous.map(item => item.id === group.id ? { ...item, status: 'cancelled' } : item)); setFeedback('Room cancelled.'); }); }}/>)}</div></section>}
  </div>;
}
