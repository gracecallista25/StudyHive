import { Search, Clock3, CalendarDays, BookOpen, ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Student, StudentFilters } from '../../types/student';
interface Props { filters: StudentFilters; onChange: (filters: StudentFilters) => void; students: Student[] }
function Select({ label, icon: Icon, value, options, onChange }: { label: string; icon: LucideIcon; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return <label className="filter-field"><span>{label}</span><span className="select-wrap"><Icon size={18}/><select value={value} onChange={e => onChange(e.target.value)} aria-label={label}>{options.map(o => <option value={o.value} key={o.value}>{o.label}</option>)}</select><ChevronDown size={15}/></span></label>;
}
const options = (values: string[], all: string) => [{ value: '', label: all }, ...[...new Set(values)].map(value => ({ value, label: value }))];
export function FilterBar({ filters, onChange, students }: Props) {
  const set = (key: keyof StudentFilters, value: string | boolean) => onChange({ ...filters, [key]: value });
  return <section className="filter-panel" aria-label="Filter students">
    <div className="filter-selects">
      <Select label="Course" icon={Search} value={filters.course} options={options(students.map(s => s.course), 'All courses')} onChange={v => set('course', v)}/>
      <Select label="Availability" icon={Clock3} value={filters.availability} options={[{ value: '', label: 'Any time' }, { value: 'evenings', label: 'Evenings' }, { value: 'afternoons', label: 'Afternoons' }, { value: 'weekends', label: 'Weekends' }]} onChange={v => set('availability', v)}/>
      <Select label="Year of study" icon={CalendarDays} value={filters.yearOfStudy} options={[{ value: '', label: 'Any year' }, ...[...new Set(students.map(s => s.yearOfStudy))].sort((a,b) => a-b).map(y => ({ value: String(y), label: 'Year ' + y }))]} onChange={v => set('yearOfStudy', v)}/>
      <Select label="Major" icon={BookOpen} value={filters.major} options={options(students.map(s => s.major), 'Any major')} onChange={v => set('major', v)}/>
    </div>
    <div className="tonight-filter"><span className="filter-label">Free Tonight</span><button type="button" role="switch" aria-checked={filters.freeTonight} aria-label="Free Tonight" className="toggle" onClick={() => set('freeTonight', !filters.freeTonight)}><span/></button><p>Show students free tonight.<br/><span>Sample availability</span></p></div>
  </section>;
}
