import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, BriefcaseBusiness, Check, Laptop } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { StudentAvatar } from '../study-buddy/StudentAvatar';
import type { Senior, SeniorQuestion } from './seniorData';

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
