import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Brush, Check, Clock3, Code2, FileText, Layers, Users } from 'lucide-react';
import { Button, CampusArt } from '../../shared/components';
import { StudentAvatar } from '../../shared/components';
import { projectTypes } from './projects';
import type { Project, ProjectArt } from './projects';


export function ProjectArtwork({ variant }: { variant: ProjectArt }) {
  return (
    <svg className="project-artwork" viewBox="0 0 150 130" fill="none" aria-hidden="true">
      {variant === 'connect' && <>
        <path d="M30 45 98 22 86 85 30 45 125 62 86 85 46 114" stroke="#557967" strokeWidth="2" />
        <circle cx="30" cy="45" r="23" fill="#d7e5d5" />
        <circle cx="98" cy="22" r="15" fill="#173d30" />
        <circle cx="86" cy="85" r="25" fill="#173d30" />
        <circle cx="125" cy="62" r="12" fill="#ffdc67" />
        <circle cx="46" cy="114" r="9" fill="#ffdc67" />
        <g fill="#173d30"><circle cx="30" cy="39" r="6" /><path d="M19 56c0-14 22-14 22 0Z" /></g>
        <g fill="#faf9f3"><circle cx="98" cy="18" r="4" /><path d="M91 29c0-10 14-10 14 0Z" /></g>
        <g fill="#ffdc67"><circle cx="86" cy="78" r="7" /><path d="M74 98c0-17 24-17 24 0Z" /></g>
      </>}
      {variant === 'planner' && <>
        <rect x="19" y="22" width="94" height="91" rx="9" fill="#faf9f3" stroke="#173d30" strokeWidth="2" />
        <path d="M19 31a9 9 0 0 1 9-9h76a9 9 0 0 1 9 9v18H19Z" fill="#173d30" />
        <path d="M39 14v20m53-20v20" stroke="#faf9f3" strokeWidth="6" strokeLinecap="round" />
        {[0, 1, 2].map(row => [0, 1, 2, 3].map(column => (
          <rect key={`${row}-${column}`} x={31 + column * 19} y={60 + row * 16} width="12" height="10" rx="2" fill={row === column ? '#ffdc67' : '#dbe6d6'} />
        )))}
        <path d="M107 106c-8-26 3-44 31-48-2 28-12 42-31 48Z" fill="#87ab8d" />
        <path d="m108 112 22-42" stroke="#173d30" strokeWidth="2" />
      </>}
      {variant === 'leaf' && <>
        <path d="M70 117C40 70 61 26 122 16c8 49-17 80-52 101Z" fill="#8eaf92" />
        <path d="M68 119C31 111 14 87 14 57c37 4 56 22 54 62Z" fill="#bed1b6" />
        <path d="M68 122 103 39M69 120 31 76" stroke="#173d30" strokeWidth="2.5" strokeLinecap="round" />
        <path d="m29 24 7 15m91 51 14-5m-9 23 12 3" stroke="#ffdc67" strokeWidth="5" strokeLinecap="round" />
      </>}
      {variant === 'code' && <>
        <rect x="15" y="23" width="112" height="88" rx="8" fill="#faf9f3" stroke="#173d30" strokeWidth="2" />
        <path d="M15 31a8 8 0 0 1 8-8h96a8 8 0 0 1 8 8v17H15Z" fill="#173d30" />
        <circle cx="29" cy="36" r="3" fill="#ffdc67" /><circle cx="40" cy="36" r="3" fill="#bed1b6" /><circle cx="51" cy="36" r="3" fill="#faf9f3" />
        <path d="m48 64-13 14 13 13m44-27 13 14-13 13M80 58 64 98" stroke="#173d30" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="127" cy="110" r="18" fill="#ffdc67" />
      </>}
    </svg>
  );
}

export function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const skills = [...new Set(project.roles.map(role => role.skills[0]))];

  return (
    <article className="project-card">
      <div className="project-card-body">
        <ProjectArtwork variant={project.artwork} />
        <div>
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
          <div className="project-skills">
            {skills.map(skill => <span key={skill}>{skill}</span>)}
          </div>
        </div>
      </div>
      <div className="project-card-footer">
        <div className="project-team-preview">
          <div className="project-avatar-stack" aria-label={project.team.map(member => member.name).join(', ')}>
            {project.team.map(member => <StudentAvatar key={member.name} variant={member.avatar} />)}
          </div>
          <span>{project.roles.length === 0 ? 'Team full' : `${project.roles.length} open ${project.roles.length === 1 ? 'role' : 'roles'}`}</span>
        </div>
        <button className="project-text-button" onClick={onOpen} aria-label={`View ${project.title}`}>
          View project <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

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


interface ProjectDetailProps {
  project: Project;
  requested: boolean;
  onBack: () => void;
  onRequest: () => void;
}

export function ProjectDetail({ project, requested, onBack, onRequest }: ProjectDetailProps) {
  const [role, setRole] = useState(project.roles[0]?.title ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) {
      setError('Add a short introduction before requesting to join.');
      return;
    }
    setError('');
    onRequest();
  }

  return (
    <>
      <button className="project-text-button project-back" onClick={onBack}>
        <ArrowLeft size={18} aria-hidden="true" /> Back to projects
      </button>
      <header className="project-detail-header">
        <div>
          <div className="project-title-line">
            <h1>{project.title}</h1>
            <span className="project-status"><Users size={16} aria-hidden="true" />{project.roles.length ? 'Open to teammates' : 'Team full'}</span>
          </div>
          <p>{project.id === 'campus-connect' ? 'Make campus life a little more connected.' : project.summary}</p>
        </div>
        <div className="project-campus-art"><CampusArt /></div>
      </header>

      <div className="project-detail-grid">
        <div className="project-brief">
          <section>
            <h2>The idea</h2>
            <p>{project.description}</p>
          </section>
          <section>
            <h2>Who we’re looking for</h2>
            {project.roles.length === 0 && <p>This team is full and isn’t accepting new requests.</p>}
            {project.roles.map(item => (
              <div className="project-role" key={item.title}>
                <span className="project-role-icon">
                  {item.title.toLowerCase().includes('design') ? <Brush size={26} /> : <Code2 size={26} />}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <div className="project-skills">
                  {item.skills.map(skill => <span key={skill}>{skill}</span>)}
                </div>
              </div>
            ))}
          </section>
          <section>
            <h2>Meet the team</h2>
            <div className="project-team">
              {project.team.map(member => (
                <div className="project-member" key={member.name}>
                  <StudentAvatar variant={member.avatar} />
                  <div><h3>{member.name}</h3><p>{member.role}</p><small>HITSZ · Shenzhen</small></div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2>Project details</h2>
            <dl className="project-facts">
              <div><FileText size={18} aria-hidden="true" /><dt>Type:</dt><dd>{project.type}</dd></div>
              <div><Layers size={18} aria-hidden="true" /><dt>Stage:</dt><dd>{project.stage}</dd></div>
              <div><Clock3 size={18} aria-hidden="true" /><dt>Commitment:</dt><dd>{project.commitment}</dd></div>
            </dl>
          </section>
        </div>

        <aside className="project-join-panel" aria-label="Join this project">
          <h2>Build with us.</h2>
          <p>{project.roles.length} open {project.roles.length === 1 ? 'role' : 'roles'} · Student-led project</p>
          {requested ? (
            <div className="project-request-success" role="status">
              <Check size={30} aria-hidden="true" />
              <h3>Request saved in preview</h3>
              <p>Your introduction is ready for this demo. No request has been sent to a project lead.</p>
            </div>
          ) : project.roles.length === 0 ? (
            <p className="project-closed-note">This team is full. Browse other projects to find an open role.</p>
          ) : (
            <form className="project-form" onSubmit={handleSubmit}>
              <label htmlFor="project-role">Your role</label>
              <select id="project-role" value={role} onChange={event => setRole(event.target.value)} required>
                {project.roles.map(item => <option key={item.title}>{item.title}</option>)}
              </select>
              <label htmlFor="project-introduction">Introduce yourself</label>
              <textarea id="project-introduction" value={message} onChange={event => setMessage(event.target.value)} required maxLength={1000} placeholder="Share your skills and what you’d like to contribute." aria-describedby={error ? 'project-request-error' : undefined} />
              {error && <p className="project-error" id="project-request-error" role="alert">{error}</p>}
              <Button type="submit">Request to join <ArrowRight size={19} aria-hidden="true" /></Button>
              <p className="project-form-note">Preview only. This does not send a real request.</p>
            </form>
          )}
        </aside>
      </div>
    </>
  );
}



