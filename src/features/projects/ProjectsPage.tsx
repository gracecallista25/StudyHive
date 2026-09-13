import { useEffect, useRef, useState } from 'react';
import { FolderOpen, Plus, Search } from 'lucide-react';
import { Button } from '../../shared/components';
import { CreateProjectForm, ProjectCard, ProjectDetail } from './ProjectComponents';
import { getProjectSkills, initialProjects, projectMatchesFilters, projectTypes } from './projects';
import type { Project } from './projects';
import './projects.css';

export function ProjectsPage() {
  const [projects, setProjects] = useState(initialProjects);
  const [screen, setScreen] = useState<'browse' | 'detail' | 'create'>('browse');
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [type, setType] = useState('');
  const [openOnly, setOpenOnly] = useState(true);
  const [requests, setRequests] = useState<string[]>([]);
  const pageRef = useRef<HTMLDivElement>(null);

  const selected = projects.find(project => project.id === selectedId);
  const skills = getProjectSkills(projects);
  const visibleProjects = projects.filter(project => projectMatchesFilters(project, search, skill, type, openOnly));

  useEffect(() => {
    pageRef.current?.focus();
    window.scrollTo(0, 0);
  }, [screen]);

  function openProject(project: Project) {
    setSelectedId(project.id);
    setScreen('detail');
  }

  function createProject(project: Project) {
    setProjects(items => [project, ...items]);
    openProject(project);
  }

  function clearFilters() {
    setSearch('');
    setSkill('');
    setType('');
    setOpenOnly(true);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
  }

  function handleSkillChange(value: string) {
    setSkill(value);
  }

  function handleTypeChange(value: string) {
    setType(value);
  }

  function handleOpenOnlyChange(value: boolean) {
    setOpenOnly(value);
  }

  return (
    <div className="page-content projects-page" ref={pageRef} tabIndex={-1}>
      <div className="project-topbar">
        <p className="breadcrumb">{screen === 'browse' ? 'Campus' : 'Projects'}<span>/</span><strong>{screen === 'detail' ? selected?.title : screen === 'create' ? 'Create project' : 'Projects'}</strong></p>
        <span className="project-topbar-note">Good things happen together.</span>
      </div>
      <p className="project-preview-note">Interactive preview · Fictional projects. Changes reset when you leave Projects.</p>

      {screen === 'detail' && selected ? (
        <ProjectDetail key={selected.id} project={selected} requested={requests.includes(selected.id)} onBack={() => setScreen('browse')} onRequest={() => setRequests(items => [...items, selected.id])} />
      ) : screen === 'create' ? (
        <CreateProjectForm onBack={() => setScreen('browse')} onCreate={createProject} />
      ) : (
        <>
          <header className="projects-header">
            <div><h1>Big ideas.<br />Better together.</h1><p>Find a project. Bring your skills. Build something real.</p></div>
            <Button onClick={() => setScreen('create')}><Plus size={22} aria-hidden="true" />Create project</Button>
          </header>

          <div className="projects-filters" role="search" aria-label="Find projects">
            <div className="project-search">
              <Search size={20} aria-hidden="true" />
              <input aria-label="Search projects" placeholder="Search projects…" value={search} onChange={event => handleSearchChange(event.target.value)} type="search" />
            </div>
            <select aria-label="Filter by skill" value={skill} onChange={event => handleSkillChange(event.target.value)}>
              <option value="">Skills</option>
              {skills.map(item => <option key={item}>{item}</option>)}
            </select>
            <select aria-label="Filter by project type" value={type} onChange={event => handleTypeChange(event.target.value)}>
              <option value="">Project type</option>
              {projectTypes.map(item => <option key={item}>{item}</option>)}
            </select>
            <label className="project-open-filter">Open roles<input type="checkbox" checked={openOnly} onChange={event => handleOpenOnlyChange(event.target.checked)} /><span aria-hidden="true" /></label>
          </div>

          <div className="projects-results-heading">
            <div><h2>{openOnly ? 'Projects looking for teammates' : 'Explore campus projects'}</h2><p role="status">{visibleProjects.length} {openOnly ? 'open ' : ''}{visibleProjects.length === 1 ? 'project' : 'projects'}</p></div>
            {(search || skill || type || !openOnly) && <button className="project-text-button" onClick={clearFilters}>Clear filters</button>}
          </div>
          <div className="projects-grid">
            {visibleProjects.map(project => <ProjectCard key={project.id} project={project} onOpen={() => openProject(project)} />)}
          </div>
          {visibleProjects.length === 0 && <div className="projects-empty"><FolderOpen size={36} aria-hidden="true" /><h2>No projects found.</h2><p>Try another skill or give your search a little more room.</p><Button onClick={clearFilters}>Clear filters</Button></div>}
        </>
      )}
      <footer className="projects-footer">Good ideas bring good people together.</footer>
    </div>
  );
}


