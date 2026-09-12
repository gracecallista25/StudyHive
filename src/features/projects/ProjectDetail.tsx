import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Brush, Check, Clock3, Code2, FileText, Layers, Users } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { CampusArt } from '../../shared/components/Artwork';
import { StudentAvatar } from '../study-buddy/StudentAvatar';
import type { Project } from './projectData';

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
