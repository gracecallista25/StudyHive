import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../shared/components/Button';
import { CoursePicker } from '../study-buddy/CoursePicker';
import { ListingSearchFields } from '../study-buddy/ListingSearchFields';
import { GroupCard } from './GroupCard';
import {
  browseGroups,
  cancelGroup,
  createGroup,
  joinGroup,
  refreshGroup,
} from './groupApi';
import type { StudyGroup } from './groupApi';
import '../study-buddy/studyBuddy.css';
import './groups.css';

const emptyFilters = {
  major: '',
  date: '',
  start_time: '',
  end_time: '',
  location: '',
};

type Screen = 'search' | 'create';

export function StudyGroupsPage({ userId }: { userId: string | null }) {
  const [course, setCourse] = useState('');
  const [pickerVersion, setPickerVersion] = useState(0);
  const [filters, setFilters] = useState(emptyFilters);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [screen, setScreen] = useState<Screen>('search');
  const [searched, setSearched] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [sent, setSent] = useState<string[]>([]);

  async function runRequest(action: () => Promise<void>) {
    setPending(true);
    setError('');
    setFeedback('');

    try {
      await action();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Please try again.');
    } finally {
      setPending(false);
    }
  }

  function hasInvalidTimeRange() {
    const onlyOneTimeProvided = Boolean(filters.start_time) !== Boolean(filters.end_time);
    const endBeforeStart = Boolean(filters.start_time) && filters.start_time >= filters.end_time;
    return onlyOneTimeProvided || endBeforeStart;
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();

    if (hasInvalidTimeRange()) {
      setError('Enter both times, with end time after start time, or leave both empty.');
      return;
    }

    void runRequest(async () => {
      const result = await browseGroups({ course, ...filters }, userId);
      setGroups(result);
      setSearched(true);
    });
  }

  function getFormValue(form: FormData, key: string) {
    return String(form.get(key) ?? '').trim();
  }

  function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) return;

    const form = new FormData(event.currentTarget);
    const courseValue = getFormValue(form, 'course');
    const location = getFormValue(form, 'location');
    const startTime = getFormValue(form, 'start_time');
    const endTime = getFormValue(form, 'end_time');
    const maxMembers = Number(getFormValue(form, 'max_members'));
    const invalidDetails = !courseValue || !location || startTime >= endTime || !Number.isInteger(maxMembers) || maxMembers < 2;

    if (invalidDetails) {
      setError('Check your course, location, time range, and capacity (at least 2).');
      return;
    }

    void runRequest(async () => {
      const group = await createGroup({
        user_id: userId,
        course: courseValue,
        date: getFormValue(form, 'date'),
        start_time: startTime,
        end_time: endTime,
        location,
        notes: getFormValue(form, 'notes'),
        max_members: maxMembers,
      });

      setGroups([group]);
      setSearched(true);
      setScreen('search');
      setFeedback('Study room created. You are its first member.');
    });
  }

  function handleStartCreating() {
    setScreen('create');
    setError('');
    setFeedback('');
  }

  function handleClearFilters() {
    setFilters(emptyFilters);
    setCourse('');
    setPickerVersion(version => version + 1);
  }

  function handleBackToRooms() {
    setScreen('search');
    setError('');
  }

  function handleJoin(groupId: string) {
    void runRequest(async () => {
      if (!userId) return;
      await joinGroup(groupId, userId);
      setSent(previous => [...previous, groupId]);
      setFeedback('Join request sent. The host must accept it before you become a member.');
    });
  }

  function handleRefresh(groupId: string) {
    void runRequest(async () => {
      const updatedGroup = await refreshGroup(groupId);
      setGroups(previous => previous.map(group => (group.id === updatedGroup.id ? updatedGroup : group)));
      setFeedback('Room updated.');
    });
  }

  function handleCancel(group: StudyGroup) {
    if (!window.confirm('Cancel this study room? It will no longer accept requests.')) return;

    void runRequest(async () => {
      if (!userId) return;
      await cancelGroup(group.id, userId);
      setGroups(previous => previous.map(item => (item.id === group.id ? { ...item, status: 'cancelled' } : item)));
      setFeedback('Room cancelled.');
    });
  }

  return (
    <div className="page-content buddy-page groups-page">
      <header>
        <p className="breadcrumb">
          Campus <span>/</span>
          <strong>Study Groups</strong>
        </p>
        <h1>
          A little company.
          <br />
          A lot of progress.
        </h1>
        <p className="group-subtitle">Find a study room, bring your questions, and learn together.</p>
      </header>

      <div className="group-toolbar">
        <h2>{screen === 'create' ? 'Create a study room' : 'Find your study room'}</h2>
        {screen === 'search' && <Button disabled={pending} onClick={handleStartCreating}>Create a room</Button>}
      </div>

      {error && <p role="alert" className="group-error">{error}</p>}
      {feedback && <p role="status" className="group-feedback">{feedback}</p>}

      {screen === 'search' ? (
        <form className="group-form" onSubmit={handleSearch}>
          <fieldset disabled={pending}>
            <CoursePicker key={pickerVersion} value={course} onChange={setCourse} required={false} allowCustom />
            <ListingSearchFields filters={filters} onChange={setFilters} />
            <div className="group-card-actions">
              <Button type="submit">{pending ? 'Loading…' : 'Find rooms'}</Button>
              <button type="button" className="reset-link" onClick={handleClearFilters}>Clear filters</button>
            </div>
          </fieldset>
        </form>
      ) : (
        <form className="group-form" onSubmit={handlePublish}>
          {!userId ? (
            <p><a href="#login">Log in</a> to create a study room.</p>
          ) : (
            <fieldset disabled={pending}>
              <div className="buddy-search-grid">
                <div>
                  <CoursePicker value={course} onChange={setCourse} allowCustom />
                  <input type="hidden" name="course" value={course} />
                </div>
                <label>Maximum members<input name="max_members" type="number" min="2" step="1" defaultValue="4" required /><small>Includes you. Set the capacity before publishing.</small></label>
                <label>Date<input name="date" type="date" required /></label>
                <label>Location<input name="location" required placeholder="Library, room 302" /></label>
                <label>Start time<input name="start_time" type="time" required /></label>
                <label>End time<input name="end_time" type="time" required /></label>
                <label className="buddy-search-location">Notes (optional)<textarea name="notes" rows={3} placeholder="What will your group work on?" /></label>
              </div>
              <Button type="submit">{pending ? 'Creating…' : 'Publish room'}</Button>
            </fieldset>
          )}
          <button type="button" className="reset-link" disabled={pending} onClick={handleBackToRooms}>Back to rooms</button>
        </form>
      )}

      {screen === 'search' && searched && (
        <section aria-label="Study rooms" aria-busy={pending}>
          <p className="group-result-count">{groups.length} {groups.length === 1 ? 'room' : 'rooms'}</p>
          {!groups.length && <div className="group-empty"><h2>No rooms found yet.</h2><p>Try fewer filters, or create a room and invite others to request a seat.</p></div>}
          <div className="group-grid">
            {groups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                userId={userId}
                pending={pending}
                sent={sent.includes(group.id)}
                onJoin={() => handleJoin(group.id)}
                onRefresh={() => handleRefresh(group.id)}
                onCancel={() => handleCancel(group)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
