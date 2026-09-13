import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [sent, setSent] = useState<Set<string>>(new Set());
  const busy = useRef(false);

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
      setScreen('results');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load listings.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  useEffect(() => {
    let active = true;
    browseListings(course, userId, filters)
      .then(realListings => {
        if (active) setListings([...realListings, ...exampleListings(course, filters)]);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  async function send(listing: SearchListing) {
    if (busy.current || sent.has(listing.id)) return;
    if (listing.example) {
      setSent(ids => new Set(ids).add(listing.id));
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
      await sendStudyRequest(listing.id, userId);
      setSent(ids => new Set(ids).add(listing.id));
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

      {(screen === 'results' || listings.length > 0) && (
        <section aria-label="Study buddy results">
          <p className="buddy-count">{listings.filter(item => !item.example).length} open study listings · {listings.filter(item => item.example).length} example profiles</p>

          {listings.length ? (
            <div className="buddy-listing-grid">
              {listings.map(listing => <div className="buddy-listing-item" key={listing.id}>
                <FocusedStudentCard
                  portrait={listing.example ? <StudentAvatar variant={listing.example.avatar} /> : <ProfilePortrait name={listing.created_by.full_name} source={listing.created_by.profile_picture} />}
                  name={listing.created_by.full_name}
                  major={listing.created_by.major}
                  degree={listing.created_by.degree}
                  year={listing.created_by.grade}
                  course={listing.course}
                  notes={listing.notes || ''}
                  presence={listing.example ? 'Example profile · Simulated request' : 'Open study listing'}
                  date={listing.date}
                  time={listing.example ? listing.example.time : `${listing.start_time}–${listing.end_time}`} mode={listing.example?.mode}
                  location={listing.location}
                />
                <Button disabled={pending || (!listing.example && !userId) || sent.has(listing.id)} onClick={() => void send(listing)}>{sent.has(listing.id) ? (listing.example ? 'Example request sent' : 'Request sent') : pending ? 'Please wait…' : (listing.example ? 'Try Study Together' : 'Study Together')}<ArrowRight size={16} /></Button>
                <p role="status" className="buddy-feedback">{sent.has(listing.id) ? (listing.example ? `Example request simulated for ${listing.created_by.full_name}. No real request was sent.` : `Study request sent to ${listing.created_by.full_name}.`) : ''}</p>
              </div>)}
            </div>
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





