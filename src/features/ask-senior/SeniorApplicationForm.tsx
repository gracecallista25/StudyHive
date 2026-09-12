import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '../../shared/components/Button';

export interface SeniorApplication {
  name: string;
  major: string;
  year: string;
  courses: string;
  topics: string;
  experience: string;
  availability: string;
}

interface SeniorApplicationFormProps {
  application: SeniorApplication | null;
  onSave: (application: SeniorApplication) => void;
  onBack: () => void;
}

export function SeniorApplicationForm({ application, onSave, onBack }: SeniorApplicationFormProps) {
  const [editing, setEditing] = useState(!application);
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? '').trim();
    const details: SeniorApplication = {
      name: value('name'),
      major: value('major'),
      year: value('year'),
      courses: value('courses'),
      topics: value('topics'),
      experience: value('experience'),
      availability: value('availability'),
    };

    if (Object.values(details).some(item => !item)) {
      setError('Complete each field so we can understand what you’d like to help with.');
      return;
    }
    setError('');
    onSave(details);
    setEditing(false);
  }

  return (
    <>
      <button className="senior-text-button senior-back" onClick={onBack}>
        <ArrowLeft size={18} aria-hidden="true" />Back to seniors
      </button>
      <header className="senior-application-header">
        <h1>Pass a little knowledge on.</h1>
        <p>Share what you’ve learned. Help someone find their next step.</p>
      </header>
      {!editing && application ? (
        <section className="senior-application-form senior-application-review" aria-label="Your senior application">
          <div role="status"><Check size={28} aria-hidden="true" /><h2>Application saved in preview.</h2></div>
          <p>This has not been submitted for review, and your profile is not listed as a senior. It stays here until you leave Ask a Senior.</p>
          <dl>
            <div><dt>Name</dt><dd>{application.name}</dd></div>
            <div><dt>Study details</dt><dd>{application.major} · {application.year}</dd></div>
            <div><dt>Courses you can help with</dt><dd>{application.courses}</dd></div>
            <div><dt>Help topics</dt><dd>{application.topics}</dd></div>
            <div><dt>Relevant experience</dt><dd>{application.experience}</dd></div>
            <div><dt>Availability</dt><dd>{application.availability}</dd></div>
          </dl>
          <Button onClick={() => setEditing(true)}>Edit application</Button>
        </section>
      ) : (
        <form className="senior-application-form" onSubmit={handleSubmit}>
          <div className="senior-application-fields">
            <label htmlFor="senior-app-name">Full name<input id="senior-app-name" name="name" autoComplete="name" defaultValue={application?.name} required maxLength={80} placeholder="Your name" /></label>
            <label htmlFor="senior-app-major">Major<input id="senior-app-major" name="major" defaultValue={application?.major} required maxLength={100} placeholder="e.g. Computer Science" /></label>
          </div>
          <label htmlFor="senior-app-year">Year of study</label>
          <select id="senior-app-year" name="year" defaultValue={application?.year ?? ''} required>
            <option value="" disabled>Select your year</option>
            {['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5 or above', 'Postgraduate'].map(year => <option key={year}>{year}</option>)}
          </select>
          <label htmlFor="senior-app-courses">Courses you can help with</label>
          <input id="senior-app-courses" name="courses" defaultValue={application?.courses} required maxLength={250} placeholder="e.g. Data Structures, Linear Algebra" />
          <label htmlFor="senior-app-topics">Help topics</label>
          <input id="senior-app-topics" name="topics" defaultValue={application?.topics} required maxLength={250} placeholder="e.g. Course planning, internships, exam preparation" />
          <label htmlFor="senior-app-experience">Why would you like to become a senior?</label>
          <textarea id="senior-app-experience" name="experience" defaultValue={application?.experience} required maxLength={2000} placeholder="Tell us about your experience and how you’d like to help other students." />
          <label htmlFor="senior-app-availability">When can you help?</label>
          <input id="senior-app-availability" name="availability" defaultValue={application?.availability} required maxLength={200} placeholder="e.g. Weekday evenings, around 1–2 hours a week" />
          {error && <p className="senior-error" role="alert">{error}</p>}
          <div className="senior-application-actions">
            <Button type="submit">Save preview application <ArrowRight size={18} aria-hidden="true" /></Button>
            <button className="senior-text-button" type="button" onClick={onBack}>Cancel</button>
          </div>
          <p className="senior-form-note">Preview only. Your application is not sent or saved to an account.</p>
        </form>
      )}
    </>
  );
}
