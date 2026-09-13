import { useEffect, useRef, useState } from 'react';
import { FolderOpen, Plus, Search } from 'lucide-react';
import { Button } from '../../shared/components';
import { CreateProjectForm, ProjectCard, ProjectDetail } from './ProjectComponents';
import { initialProjects, projectMatchesFilters, projectTypes, projectsConnected, loadProjects, publishProject, requestProjectRole, cancelProject } from './projects';
import type { Project } from './projects';
import './projects.css';

export function ProjectsPage({ userId }: { userId: string | null }) {
  const [projects, setProjects] = useState<Project[]>(projectsConnected ? [] : initialProjects);
  const [loading, setLoading] = useState(projectsConnected);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!projectsConnected) return;
    let active = true;
    setLoading(true);
    setError('');
    loadProjects().then(items => { if (active) setProjects(items); })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Projects could not be loaded. Please try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  const [screen, setScreen] = useState<'browse' | 'detail' | 'create'>('browse');
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [type, setType] = useState('');
  const [openOnly, setOpenOnly] = useState(true);
  const [requests, setRequests] = useState<string[]>([]);
  const pageRef = useRef<HTMLDivElement>(null);

  const selected = projects.find(project => project.id === selectedId);
  const visibleProjects = projects.filter(project => projectMatchesFilters(project, search, skill, type, openOnly));

  useEffect(() => {
    pageRef.current?.focus();
    window.scrollTo(0, 0);
  }, [screen]);

  function openProject(project: Project) {
    setSelectedId(project.id);
    setScreen('detail');
  }

  async function createProject(project: Project) {
    if (projectsConnected && !userId) throw new Error('Log in to create a project.');
    const saved = projectsConnected ? await publishProject(userId!, project) : project;
    setProjects(items => [saved, ...items]);
    openProject(saved);
  }

  async function handleRequest(role: string, message: string) {
    if (!selected) return;
    if (projectsConnected) {
      if (!userId) throw new Error('Log in to request a role.');
      await requestProjectRole(selected.id, userId, role, message);
    }
    setRequests(items => [...items, selected.id]);
  }

  async function handleCancel() {
    if (!selected || !userId || cancelling) return;
    setCancelling(true);
    try {
      await cancelProject(selected.id, userId);
      setProjects(items => items.filter(item => item.id !== selected.id));
      setScreen('browse');
    } catch { setError('The project could not be cancelled. Please try again.'); }
    finally { setCancelling(false); }
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
      {!projectsConnected && <p className="project-preview-note">Interactive preview · Fictional projects. Changes reset when you leave Projects.</p>}
      {loading && <p role="status">Loading projects...</p>}
      {error && <p role="alert">{error} <button onClick={() => setAttempt(value => value + 1)}>Try again</button></p>}
      {selected?.creatorId === userId && screen === 'detail' && <Button disabled={cancelling} onClick={() => void handleCancel()}>{cancelling ? 'Cancelling...' : 'Cancel project'}</Button>}

      {screen === 'detail' && selected ? (
        <ProjectDetail key={selected.id} project={selected} requested={requests.includes(selected.id)} canRequest={!projectsConnected || (!!userId && selected.creatorId !== userId)} onBack={() => setScreen('browse')} onRequest={handleRequest} />
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
            <input className="project-skill-search" type="search" aria-label="Filter by skill" placeholder="Search skills…" value={skill} onChange={event => handleSkillChange(event.target.value)} />
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


