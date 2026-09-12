import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { projectTypes } from './projectData';
import type { Project } from './projectData';

export function CreateProjectForm({ onBack, onCreate }: { onBack: () => void; onCreate: (project: Project) => void }) {
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? '').trim();
    const skills = [...new Set(value('skills').split(',').map(skill => skill.trim()).filter(Boolean))];

    if (!value('title') || !value('summary') || !value('description') || !value('role') || skills.length === 0) {
      setError('Fill in each field and add at least one skill.');
      return;
    }

    onCreate({
      id: crypto.randomUUID(),
      title: value('title'),
      summary: value('summary'),
      description: value('description'),
      type: value('type'),
      stage: 'Exploring ideas',
      commitment: 'Flexible',
      artwork: 'connect',
      roles: [{ title: value('role'), description: 'Bring your skills and help shape this project together.', skills }],
      team: [{ name: 'You', role: 'Project lead · Preview', avatar: 'lin' }],
    });
  }

  return (
    <>
      <button className="project-text-button project-back" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" />Back to projects</button>
      <header className="project-create-header"><h1>Start something good.</h1><p>Share your idea. Find the people to build it with.</p></header>
      <form className="project-form project-create-form" onSubmit={handleSubmit}>
        <label htmlFor="new-project-title">Project name</label>
        <input id="new-project-title" name="title" maxLength={70} required placeholder="Give your idea a name" />
        <label htmlFor="new-project-summary">One-line summary</label>
        <input id="new-project-summary" name="summary" maxLength={160} required placeholder="What will you build together?" />
        <label htmlFor="new-project-description">The idea</label>
        <textarea id="new-project-description" name="description" maxLength={2000} required placeholder="Describe the problem, your idea, and where you’d like to start." />
        <div className="project-create-fields">
          <div><label htmlFor="new-project-type">Project type</label><select id="new-project-type" name="type">{projectTypes.map(type => <option key={type}>{type}</option>)}</select></div>
          <div><label htmlFor="new-project-role">Who are you looking for?</label><input id="new-project-role" name="role" maxLength={60} required placeholder="e.g. UI designer" /></div>
        </div>
        <label htmlFor="new-project-skills">Skills needed</label>
        <input id="new-project-skills" name="skills" maxLength={150} required placeholder="e.g. React, UI design" aria-describedby="project-skills-help" />
        <small id="project-skills-help">Separate skills with commas.</small>
        {error && <p className="project-error" role="alert">{error}</p>}
        <Button type="submit">Create preview project <ArrowRight size={18} aria-hidden="true" /></Button>
        <p className="project-form-note">This preview stays in this page’s memory. It is not published or saved to an account.</p>
      </form>
    </>
  );
}
