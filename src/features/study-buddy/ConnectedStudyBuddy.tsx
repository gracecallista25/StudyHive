import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AcademicArt } from '../../shared/components';
import { Button } from '../../shared/components';
import { StudentAvatar } from '../../shared/components';
import { ProfilePortrait } from '../profile/ProfilePortrait';
import { CoursePicker, FocusedStudentCard, ListingSearchFields } from './StudyBuddyComponents';
import { exampleListings, type SearchListing, browseListings, createListing, sendStudyRequest } from './studyBuddy';
import type { ListingSearchFilters } from './studyBuddy';
import './studyBuddy.css';

const emptyListingFilters: ListingSearchFilters = {
  major: '',
  date: '',
  start_time: '',
  end_time: '',
  location: '',
};

type Screen = 'search' | 'results' | 'create';

export function ConnectedStudyBuddy({ userId }: { userId: string | null }) {
  const [filters, setFilters] = useState<ListingSearchFilters>(emptyListingFilters);
  const [course, setCourse] = useState('');

  const [screen, setScreen] = useState<Screen>('search');
  const [listings, setListings] = useState<SearchListing[]>([]);
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [sent, setSent] = useState<Set<string>>(new Set());
  const busy = useRef(false);
  const current = listings[index];

  function changeScreen(nextScreen: Screen) {
    setError('');
    setNotice('');
    setScreen(nextScreen);
  }

  function validateSearch() {
    if (!!filters.start_time !== !!filters.end_time) {
      return 'Enter both start and end time, or leave both empty.';
    }
    if (filters.start_time && filters.start_time >= filters.end_time) {
      return 'End time must be after start time.';
    }
    return '';
  }

  async function search(event?: FormEvent) {
    event?.preventDefault();
    if (busy.current) return;

    const validationError = validateSearch();
    if (validationError) {
      setError(validationError);
      return;
    }

    busy.current = true;
    setPending(true);
    setError('');
    setNotice('');
    try {
      const realListings = await browseListings(course, userId, filters);
      setListings([...realListings, ...exampleListings(course, filters)]);
      setIndex(0);
      setScreen('results');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load listings.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  async function send() {
    if (!current || busy.current || sent.has(current.id)) return;
    if (current.example) {
      setSent(ids => new Set(ids).add(current.id));
      return;
    }
    if (!userId) {
      setError('Log in before sending a study request.');
      return;
    }

    busy.current = true;
    setPending(true);
    setError('');
    try {
      await sendStudyRequest(current.id, userId);
      setSent(ids => new Set(ids).add(current.id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not send the request.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    if (!userId || !course) {
      setError(!userId ? 'Log in before creating a listing.' : 'Choose a course from the list.');
      return;
    }

    const values = new FormData(event.currentTarget);
    const startTime = String(values.get('start_time'));
    const endTime = String(values.get('end_time'));
    const location = String(values.get('location')).trim();
    if (startTime >= endTime || !location) {
      setError(!location ? 'Enter a location.' : 'End time must be after start time.');
      return;
    }

    busy.current = true;
    setPending(true);
    setError('');
    try {
      await createListing({
        user_id: userId,
        course,
        date: String(values.get('date')),
        start_time: startTime,
        end_time: endTime,
        location,
        notes: String(values.get('notes')).trim(),
      });
      setScreen('search');
      setNotice('Your study listing is published. Other students can now find it.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create the listing.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  function clearOptionalFilters() {
    setFilters(emptyListingFilters);
    setError('');
  }

  function moveToPrevious() {
    setIndex(previous => previous - 1);
    setError('');
  }

  function moveToNext() {
    setIndex(previous => previous + 1);
    setError('');
  }

  return (
    <div className="page-content buddy-page">
      <header className="hero">
        <div className="hero-copy">
          <p className="breadcrumb">Campus <span>/</span><strong>Study Buddy</strong></p>
          <h1>Good company.<br />Better progress.</h1>
          <p className="hero-subtitle">{screen === 'create' ? 'Invite someone to study with you.' : 'What are you studying today?'}</p>
        </div>
        <AcademicArt />
      </header>

      {!userId && <p className="buddy-note">You can browse listings. <a className="login-action" href="#login">Log in</a> to create a listing or send a request.</p>}

      {screen !== 'create' && (
        <form className="buddy-start buddy-search-form" onSubmit={search}>
          <fieldset disabled={pending} className="buddy-live-fields">
            <CoursePicker value={course} onChange={setCourse} required={false} allowCustom />
            <ListingSearchFields filters={filters} onChange={next => { setFilters(next); setError(''); }} />
            <div className="buddy-search-actions">
              <Button type="submit">{pending ? 'Finding study buddies…' : 'Find Study Buddies'}<ArrowRight size={17} /></Button>
              <Button type="button" disabled={!userId} onClick={() => changeScreen('create')}>Create a study listing</Button>
              <button className="reset-link" type="button" onClick={clearOptionalFilters}>Clear optional filters</button>
            </div>
          </fieldset>
        </form>
      )}

      {screen === 'create' && (
        <form className="buddy-start" onSubmit={publish}>
          <fieldset disabled={pending} className="buddy-live-fields">
            <CoursePicker value={course} onChange={setCourse} allowCustom />
            <label>Date<input type="date" name="date" required /></label>
            <div className="buddy-time-fields">
              <label>Start time<input type="time" name="start_time" required /></label>
              <label>End time<input type="time" name="end_time" required /></label>
            </div>
            <label>Location<input name="location" placeholder="Library room or online meeting location" required maxLength={300} /></label>
            <label>Notes (optional)<textarea name="notes" rows={3} placeholder="What would you like to work on together?" maxLength={2000} /></label>
            <Button type="submit">{pending ? 'Publishing…' : 'Publish listing'}</Button>
            <Button type="button" onClick={() => changeScreen('search')}>Cancel</Button>
          </fieldset>
        </form>
      )}

      {screen === 'results' && (
        <section aria-label="Study buddy results">
          <p className="buddy-count">{listings.filter(item => !item.example).length} open study listings · {listings.filter(item => item.example).length} example profiles</p>

          {current ? (
            <>
              <FocusedStudentCard
                portrait={current.example ? <StudentAvatar variant={current.example.avatar} /> : <ProfilePortrait name={current.created_by.full_name} source={current.created_by.profile_picture} />}
                name={current.created_by.full_name}
                major={current.created_by.major}
                degree={current.created_by.degree}
                year={current.created_by.grade}
                course={current.course}
                notes={current.notes || ''}
                presence={current.example ? 'Example profile · Simulated request' : 'Open study listing'}
                date={current.date}
                time={current.example ? current.example.time : `${current.start_time}–${current.end_time}`} mode={current.example?.mode}
                location={current.location}
              />
              <p className="buddy-position" aria-live="polite">Listing {index + 1} of {listings.length}: {current.created_by.full_name}</p>
              <div className="buddy-actions">
                <Button disabled={pending || index === 0} onClick={moveToPrevious}><ArrowLeft size={16} />Back</Button>
                <Button disabled={pending || (!current.example && !userId) || sent.has(current.id)} onClick={() => void send()}>{sent.has(current.id) ? (current.example ? 'Example request sent' : 'Request sent') : pending ? 'Please wait…' : (current.example ? 'Try Study Together' : 'Study Together')}</Button>
                <Button disabled={pending || index === listings.length - 1} onClick={moveToNext}>Next<ArrowRight size={16} /></Button>
              </div>
              <p role="status" className="buddy-feedback">{sent.has(current.id) ? (current.example ? `Example request simulated for ${current.created_by.full_name}. No real request was sent.` : `Study request sent to ${current.created_by.full_name}.`) : ''}</p>
            </>
          ) : (
            <div className="empty-state">
              <h2>No study buddies found right now.</h2>
              <p>Be the first to create a listing for this course.</p>
              <div className="buddy-actions">
                <Button onClick={() => document.getElementById('buddy-course')?.focus()}>Change Course</Button>
              </div>
            </div>
          )}
        </section>
      )}

      {error && <p className="buddy-feedback" role="alert">{error}</p>}
      {notice && <p className="buddy-feedback" role="status">{notice}</p>}
    </div>
  );
}





