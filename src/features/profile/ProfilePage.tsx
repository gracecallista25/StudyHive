import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { ArrowRight, BookOpen, Check, Leaf, RefreshCw, Sprout, Users, Handshake, Flame, GraduationCap } from 'lucide-react';
import { Button } from '../../shared/components';
import { ProfilePortrait } from './ProfilePortrait';
import { loadBadges, loadProfile, saveDisplayedBadges, saveProfile } from './profile';
import type { BadgeCatalogue, Profile } from './profile';
import { safePicture } from './profile';

type SaveTarget = 'profile' | 'badges' | '';

function BadgeEmblem({ id }: { id: string }) {
  const icons = { setup_hive: Sprout, meet_someone: Handshake, study_group: Users, help_junior: BookOpen, find_teammate: GraduationCap, day_streak: Flame };
  const Icon = icons[id as keyof typeof icons] || Leaf;
  return <span className={'profile-emblem emblem-' + id} aria-hidden="true"><span><Icon size={38} strokeWidth={1.5} /></span></span>;
}

function ProfileBranches() {
  return <svg viewBox="0 0 360 180" aria-hidden="true" className="profile-branches">
    <path d="M185 190Q170 90 65 15M182 150Q235 85 310 35M160 110Q140 60 170 0" fill="none" stroke="currentColor" strokeWidth="3" />
    {[ [92,35,-45], [124,65,20], [148,100,-45], [181,135,25], [219,104,-20], [260,71,25], [162,45,-25] ].map(([x,y,rotation], index) => <g key={index} transform={`translate(${x} ${y}) rotate(${rotation})`}>
      <path d="M0 0Q-48-45-62-5Q-34 19 0 0Z" fill="currentColor" opacity=".8" />
      <path d="M-57-5L0 0" stroke="#d4cf99" strokeWidth="1" />
    </g>)}
  </svg>;
}

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
      <BadgeEmblem id={id} />
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
  const [readingPicture, setReadingPicture] = useState(false);

  async function handlePictureUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    clearFeedback();
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Choose a PNG, JPG, or WebP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Choose an image smaller than 2 MB.');
      return;
    }
    setReadingPicture(true);
    try {
      const imageData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('The picture could not be read. Please try again.'));
        reader.readAsDataURL(file);
      });
      const preview = new Image();
      preview.src = imageData;
      await preview.decode();
      setPicture(imageData);
    } catch {
      setError('The picture could not be read. Please choose another image.');
    } finally {
      setReadingPicture(false);
    }
  }

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
    if (!user || saving.current || readingPicture) return;
    clearFeedback();

    if (target === 'profile' && picture.trim() && !safePicture(picture.trim())) {
      setError('Please choose a valid profile picture.');
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
        <div className="profile-header-leaf"><ProfileBranches /></div>
      </header>

      <div className="profile-columns">
        <aside className="profile-summary">
          <div className="profile-summary-cover"><span>YOUR CORNER<br />OF CAMPUS</span><ProfileBranches /><BookOpen className="profile-cover-books" size={100} strokeWidth={.8} /></div>
          <div className="profile-summary-body">
            <ProfilePortrait name={user.full_name} source={user.profile_picture} />
            <h2>{user.full_name}</h2>
            <p>{user.major}</p>
            <span className="profile-year">{user.degree === 'bachelor' ? "Bachelor's" : user.degree === 'master' ? "Master's" : user.degree} · Year {user.grade}</span>
            <p className="profile-description">{user.description || 'A few words about you can start a great study partnership.'}</p>
            <div className="profile-featured-badges">
              {user.badges_displayed.length ? user.badges_displayed.map(id => <span key={id}><BadgeEmblem id={id} /><span>{catalogue[id]?.name || id}</span></span>) : <p>No badges displayed yet.</p>}
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
            <fieldset disabled={!!busy || readingPicture} className="profile-fields profile-introduction-fields">
              <div>
              <label htmlFor="profile-description">About you</label>
              <textarea id="profile-description" rows={4} placeholder="Tell other students a little about yourself and what you would like to study together." value={description} onChange={event => { setDescription(event.target.value); clearFeedback(); }} />
              </div>
              <div>
              <label htmlFor="profile-picture">Profile picture <span>Optional</span></label>
              <div className="profile-picture-input"><ProfilePortrait name={user.full_name} source={picture} /><input id="profile-picture" type="file" accept="image/png,image/jpeg,image/webp" aria-describedby="profile-picture-hint" onChange={event => void handlePictureUpload(event)} /></div>
              <p id="profile-picture-hint" className="profile-hint">PNG, JPG or WebP, up to 2 MB. Save profile to keep your picture.</p>
              {picture && <button type="button" className="profile-text-button" onClick={() => { setPicture(''); clearFeedback(); }}>Remove picture</button>}
              </div>
              <div className="profile-form-actions">
                <button type="button" className="profile-text-button" disabled={!profileDirty} onClick={() => { setDescription(user.description); setPicture(user.profile_picture); clearFeedback(); }}>Discard changes</button>
                <Button disabled={!profileDirty}>{busy === 'profile' ? 'Saving...' : 'Save profile'}<Check size={17} /></Button>
              </div>
            </fieldset>
            {readingPicture && <p role="status">Reading your picture...</p>}
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



