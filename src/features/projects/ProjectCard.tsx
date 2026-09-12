import { ArrowRight } from 'lucide-react';
import { StudentAvatar } from '../study-buddy/StudentAvatar';
import { ProjectArtwork } from './ProjectArtwork';
import type { Project } from './projectData';

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
