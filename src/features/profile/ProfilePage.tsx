import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Award, ArrowRight, BookOpen, Check, Leaf, LockKeyhole, RefreshCw } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { ProfilePortrait } from './ProfilePortrait';
import { loadBadges, loadProfile, saveDisplayedBadges, saveProfile } from './profileApi';
import type { BadgeCatalogue, Profile } from './profileTypes';
import { safePicture } from './pictureUrl';

type SaveTarget = 'profile' | 'badges' | '';

interface BadgeOptionProps {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}

function BadgeOption({ id, name, description, earned, checked, disabled, onToggle }: BadgeOptionProps) {
  return (
    <label className={'profile-badge-option' + (checked ? ' selected' : '') + (!earned ? ' locked' : '')} key={id}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onToggle} />
      <span className="profile-badge-icon">{earned ? <Award size={25} /> : <LockKeyhole size={22} />}</span>
      <strong>{name}</strong>
      <span>{description}</span>
      <small>{earned ? checked ? 'Displayed' : 'Earned' : 'Not earned yet'}</small>
    </label>
  );
}

export function ProfilePage({ userId }: { userId: string | null }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [catalogue, setCatalogue] = useState<BadgeCatalogue>({});
  const [description, setDescription] = useState('');
  const [picture, setPicture] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState<SaveTarget>('');
  const [attempt, setAttempt] = useState(0);
  const saving = useRef(false);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    setLoading(true);
    setLoadError('');

    Promise.all([loadProfile(userId), loadBadges()])
      .then(([profile, badges]) => {
        if (!active) return;
        setUser(profile);
        setCatalogue(badges);
        setDescription(profile.description);
        setPicture(profile.profile_picture);
        setSelected(profile.badges_displayed);
      })
      .catch((reason: Error) => {
        if (active) setLoadError(reason.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId, attempt]);

  function clearFeedback() {
    setError('');
    setFeedback('');
  }

  async function save(event: FormEvent, target: Exclude<SaveTarget, ''>) {
    event.preventDefault();
    if (!user || saving.current) return;
    clearFeedback();

    if (target === 'profile' && picture.trim() && !safePicture(picture.trim())) {
      setError('Please enter a valid http or https picture URL.');
      return;
    }

    saving.current = true;
    setBusy(target);
    try {
      if (target === 'profile') {
        const updated = await saveProfile(user.id, {
          description: description.trim(),
          profile_picture: picture.trim(),
        });
        setUser(updated);
        setDescription(updated.description);
        setPicture(updated.profile_picture);
        setSelected(updated.badges_displayed);
        setFeedback('Profile saved successfully.');
      } else {
        const displayed = await saveDisplayedBadges(user.id, selected);
        setUser({ ...user, badges_displayed: displayed });
        setSelected(displayed);
        setFeedback('Displayed badges saved successfully.');
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Your changes could not be saved.');
    } finally {
      saving.current = false;
      setBusy('');
    }
  }

  function handleBadgeToggle(id: string, checked: boolean) {
    setSelected(current => checked ? current.filter(value => value !== id) : [...current, id]);
    clearFeedback();
  }

  if (!userId) {
    return (
      <section className="profile-page">
        <p className="profile-breadcrumb">Campus / My Profile</p>
        <h1>A little more you.</h1>
        <div className="profile-state">
          <Leaf size={34} />
          <h2>Your Hive starts with you.</h2>
          <p>Log in to view your profile, introduce yourself, and choose your badges.</p>
          <a className="button" href="#login">Log in to your profile <ArrowRight size={17} /></a>
        </div>
      </section>
    );
  }

  if (loading) {
    return <section className="profile-page"><p role="status" className="profile-state">Loading your profile...</p></section>;
  }

  if (loadError || !user) {
    return (
      <section className="profile-page">
        <h1>My Profile</h1>
        <div className="profile-state">
          <p role="alert">{loadError || 'Your profile is unavailable.'}</p>
          <Button onClick={() => setAttempt(current => current + 1)}><RefreshCw size={16} />Try again</Button>
          <a href="#login">Back to login</a>
        </div>
      </section>
    );
  }

  const profileDirty = description !== user.description || picture !== user.profile_picture;
  const badgesDirty = JSON.stringify(selected) !== JSON.stringify(user.badges_displayed);

  return (
    <section className="profile-page">
      <header className="profile-header">
        <div>
          <p className="profile-breadcrumb">Campus / My Profile</p>
          <h1>A little more you.</h1>
          <p>Let the right people get to know you.</p>
        </div>
        <div className="profile-header-leaf" aria-hidden="true"><Leaf size={58} strokeWidth={1} /></div>
      </header>

      <div className="profile-columns">
        <aside className="profile-summary">
          <div className="profile-summary-cover"><span>YOUR CORNER OF CAMPUS</span><BookOpen size={32} strokeWidth={1.3} /></div>
          <div className="profile-summary-body">
            <ProfilePortrait name={user.full_name} source={user.profile_picture} />
            <h2>{user.full_name}</h2>
            <p>{user.major}</p>
            <span className="profile-year">{user.degree === 'bachelor' ? "Bachelor's" : user.degree === 'master' ? "Master's" : user.degree} · Year {user.grade}</span>
            <p className="profile-description">{user.description || 'A few words about you can start a great study partnership.'}</p>
            <div className="profile-featured-badges">
              {user.badges_displayed.length ? user.badges_displayed.map(id => <span key={id}><Award size={17} />{catalogue[id]?.name || id}</span>) : <p>No badges displayed yet.</p>}
            </div>
            <div className="profile-account">
              <h3>Academic details</h3>
              <dl>
                <div><dt>Student ID</dt><dd>{user.student_id}</dd></div>
                <div><dt>Email</dt><dd>{user.email}</dd></div>
              </dl>
              <p>These details come from registration.</p>
            </div>
          </div>
        </aside>

        <div className="profile-editors">
          <form className="profile-panel" onSubmit={event => void save(event, 'profile')}>
            <div className="profile-section-heading"><div><p className="profile-eyebrow">THE INTRODUCTION</p><h2>Make yourself at home.</h2></div><Leaf size={23} /></div>
            <p className="profile-subtitle">What are you learning, building, or hoping to find?</p>
            <fieldset disabled={!!busy} className="profile-fields">
              <label htmlFor="profile-description">About you</label>
              <textarea id="profile-description" rows={4} placeholder="Tell other students a little about yourself and what you would like to study together." value={description} onChange={event => { setDescription(event.target.value); clearFeedback(); }} />
              <label htmlFor="profile-picture">Profile picture URL <span>Optional</span></label>
              <div className="profile-picture-input"><ProfilePortrait name={user.full_name} source={picture} /><input id="profile-picture" type="text" inputMode="url" placeholder="https://example.com/your-picture.jpg" value={picture} onChange={event => { setPicture(event.target.value); clearFeedback(); }} /></div>
              <p className="profile-hint">Use a link to an image. Leave it empty to use your initials.</p>
              <div className="profile-form-actions">
                <button type="button" className="profile-text-button" disabled={!profileDirty} onClick={() => { setDescription(user.description); setPicture(user.profile_picture); clearFeedback(); }}>Discard changes</button>
                <Button disabled={!profileDirty}>{busy === 'profile' ? 'Saving...' : 'Save profile'}<Check size={17} /></Button>
              </div>
            </fieldset>
          </form>

          <form className="profile-panel profile-badges-panel" onSubmit={event => void save(event, 'badges')}>
            <div className="profile-section-heading"><div><p className="profile-eyebrow">LITTLE MOMENTS, SHARED</p><h2>Your Hive badges.</h2></div><span className="profile-badge-count">{selected.length} / 3 displayed</span></div>
            <p className="profile-subtitle">Choose up to three earned badges to show on your profile.</p>
            {!user.badges_earned.length && <p className="profile-empty-badges">Your collection starts here. Earned badges will appear as you take part in campus life.</p>}
            <fieldset disabled={!!busy} className="profile-fields">
              <legend className="sr-only">Choose displayed badges</legend>
              <div className="profile-badge-grid">
                {Object.entries(catalogue).map(([id, badge]) => {
                  const earned = user.badges_earned.includes(id);
                  const checked = selected.includes(id);
                  return <BadgeOption key={id} id={id} name={badge.name} description={badge.description} earned={earned} checked={checked} disabled={!earned || (!checked && selected.length >= 3)} onToggle={() => handleBadgeToggle(id, checked)} />;
                })}
              </div>
              {!Object.keys(catalogue).length && <p>No badges are available yet.</p>}
              <div className="profile-form-actions"><p className="profile-hint">Badges are awarded by StudyHive.</p><Button disabled={!badgesDirty}>{busy === 'badges' ? 'Saving...' : 'Save badges'}<Check size={17} /></Button></div>
            </fieldset>
          </form>
          {error && <p className="profile-message error" role="alert">{error}</p>}
          {feedback && <p className="profile-message" role="status">{feedback}</p>}
        </div>
      </div>
    </section>
  );
}
