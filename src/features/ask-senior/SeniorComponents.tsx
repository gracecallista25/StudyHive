import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, BriefcaseBusiness, Check, Laptop } from 'lucide-react';
import { Button } from '../../shared/components';
import { StudentAvatar } from '../../shared/components';
import type { Senior, SeniorQuestion, SeniorApplication } from './seniors';


interface SeniorCardProps {
  senior: Senior;
  onView: () => void;
  onAsk: () => void;
}

export function SeniorCard({ senior, onView, onAsk }: SeniorCardProps) {
  return (
    <article className="senior-card">
      <StudentAvatar variant={senior.avatar} />
      <div className="senior-card-info">
        <div className="senior-card-heading">
          <h3>{senior.name}</h3>
          <span className={'senior-availability' + (senior.available ? '' : ' is-away')}>
            {senior.available ? 'Available to help' : 'Not available'}
          </span>
        </div>
        <p className="senior-meta">{senior.major} · Year {senior.year}</p>
        <p className="senior-summary">{senior.summary}</p>
        <div className="senior-tags">
          {senior.tags.map(tag => <span key={tag}>{tag}</span>)}
        </div>
      </div>
      <div className="senior-card-actions">
        <button className="senior-text-button" onClick={onView} aria-label={`View ${senior.name}'s profile`}>
          View profile <ArrowRight size={17} aria-hidden="true" />
        </button>
        <Button onClick={onAsk} disabled={!senior.available} aria-label={`Ask ${senior.name} a question`}>
          Ask a question
        </Button>
      </div>
    </article>
  );
}


interface SeniorProfileProps {
  senior: Senior;
  focusQuestion: boolean;
  savedQuestion?: SeniorQuestion;
  onBack: () => void;
  onSave: (question: SeniorQuestion) => void;
  onEdit: () => void;
}

const topicIcons = [Laptop, BriefcaseBusiness, BookOpen];

export function SeniorProfile({ senior, focusQuestion, savedQuestion, onBack, onSave, onEdit }: SeniorProfileProps) {
  const [topic, setTopic] = useState(savedQuestion?.topic ?? senior.topics[0].title);
  const [message, setMessage] = useState(savedQuestion?.message ?? '');
  const [error, setError] = useState('');
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const firstName = senior.name.split(' ')[0];

  useEffect(() => {
    if (focusQuestion) questionRef.current?.focus();
  }, [focusQuestion]);

  function handleSuggestion(question: string, suggestedTopic: string) {
    setTopic(suggestedTopic);
    setMessage(question);
    setError('');
    questionRef.current?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!senior.available) return;
    if (message.trim().length < 10) {
      setError('Add a little more detail—at least 10 characters—so your question is clear.');
      questionRef.current?.focus();
      return;
    }
    setError('');
    onSave({ topic, message: message.trim() });
  }

  return (
    <>
      <button className="senior-text-button senior-back" onClick={onBack}>
        <ArrowLeft size={18} aria-hidden="true" /> Back to seniors
      </button>
      <div className="senior-profile-grid">
        <div className="senior-profile-main">
          <header className="senior-profile-header">
            <StudentAvatar variant={senior.avatar} />
            <div>
              <h1>{senior.name}</h1>
              <p className="senior-meta">{senior.major} · Year {senior.year}</p>
              <span className={'senior-availability' + (senior.available ? '' : ' is-away')}>
                {senior.available ? 'Available to help' : 'Not available right now'}
              </span>
              <p className="senior-profile-subtitle">A little advice can make your next step easier.</p>
            </div>
          </header>
          <section className="senior-profile-section">
            <h2>Hello, I’m {firstName}.</h2>
            <p>{senior.bio}</p>
          </section>
          <section className="senior-profile-section">
            <h2>What I can help with</h2>
            {senior.topics.map((item, index) => {
              const Icon = topicIcons[index % topicIcons.length];
              return (
                <div className="senior-topic" key={item.title}>
                  <span className="senior-topic-icon"><Icon size={25} aria-hidden="true" /></span>
                  <div><h3>{item.title}</h3><p>{item.description}</p></div>
                </div>
              );
            })}
          </section>
          {senior.available && !savedQuestion && (
            <section className="senior-profile-section">
              <h2>A good question starts here</h2>
              <p>Not sure what to ask? Here are a couple of examples:</p>
              <div className="senior-suggestions">
                {senior.suggestions.map(item => (
                  <button key={item.question} onClick={() => handleSuggestion(item.question, item.topic)}>
                    {item.question}<ArrowRight size={18} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="senior-question-panel" aria-label="Ask a question">
          <h2>Ask {firstName} a question.</h2>
          <p>A clear question makes it easier to help.</p>
          {!senior.available ? (
            <div className="senior-question-result">
              <h3>Taking a little study break.</h3>
              <p>{firstName} has paused new questions. Browse the other seniors to find someone available.</p>
              <Button onClick={onBack}>Find another senior</Button>
            </div>
          ) : savedQuestion ? (
            <div className="senior-question-result">
              <div role="status"><Check size={30} aria-hidden="true" /><h3>Question saved in preview.</h3></div>
              <p>No question has been sent. Your draft is kept until you leave Ask a Senior.</p>
              <h4>{savedQuestion.topic}</h4>
              <blockquote>{savedQuestion.message}</blockquote>
              <Button onClick={onEdit}>Edit question</Button>
            </div>
          ) : (
            <form className="senior-question-form" onSubmit={handleSubmit}>
              <label htmlFor="senior-topic">Topic</label>
              <select id="senior-topic" value={topic} onChange={event => setTopic(event.target.value)}>
                {senior.topics.map(item => <option key={item.title}>{item.title}</option>)}
              </select>
              <label htmlFor="senior-question">Your question</label>
              <textarea id="senior-question" ref={questionRef} value={message} onChange={event => setMessage(event.target.value)} required maxLength={2000} placeholder="What are you working on, and where are you getting stuck?" aria-invalid={Boolean(error)} aria-describedby={error ? 'senior-question-hint senior-question-error' : 'senior-question-hint'} />
              <p id="senior-question-hint" className="senior-form-hint">Include what you’ve tried so far.</p>
              {error && <p id="senior-question-error" className="senior-error" role="alert">{error}</p>}
              <Button type="submit">Save preview question <ArrowRight size={19} aria-hidden="true" /></Button>
              <p className="senior-form-note">Preview only. Questions are not sent to seniors or Messages.</p>
            </form>
          )}
        </aside>
      </div>
    </>
  );
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




