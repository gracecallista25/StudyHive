import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { courses } from './buddyData';

interface CoursePickerProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  allowCustom?: boolean;
}

export function CoursePicker({ value, onChange, required = true, allowCustom = false }: CoursePickerProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const options = courses.filter(course => course.toLowerCase().includes(query.trim().toLowerCase()));

  function chooseCourse(course: string) {
    (document.getElementById('buddy-course') as HTMLInputElement | null)?.setCustomValidity('');
    setQuery(course);
    onChange(course);
    setOpen(false);
    setActive(-1);
  }

  function handleInputChange(nextValue: string) {
    setQuery(nextValue);
    onChange(allowCustom ? nextValue : courses.find(course => course.toLowerCase() === nextValue.trim().toLowerCase()) ?? '');
    setOpen(true);
    setActive(-1);
    (document.getElementById('buddy-course') as HTMLInputElement | null)?.setCustomValidity('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActive(current => event.key === 'ArrowDown' ? Math.min(current + 1, options.length - 1) : Math.max(current - 1, 0));
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
    if (event.key === 'Enter' && open && options.length) {
      event.preventDefault();
      chooseCourse(options[active >= 0 ? active : 0]);
    }
  }

  function clearAndOpen() {
    setQuery('');
    onChange('');
    setActive(-1);
    setOpen(true);
    document.getElementById('buddy-course')?.focus();
  }

  return (
    <div className="buddy-picker" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <label htmlFor="buddy-course">Course</label>
      <div className="buddy-picker-control">
        <input
          id="buddy-course"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="buddy-course-options"
          aria-activedescendant={open && active >= 0 && options[active] ? `buddy-option-${active}` : undefined}
          required={required}
          autoComplete="off"
          placeholder="Search or choose a course"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={event => handleInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="button" aria-label="Show all courses" onClick={clearAndOpen}><ChevronDown size={20} /></button>
      </div>
      {open && (
        <ul id="buddy-course-options" role="listbox" aria-label="Courses">
          {options.map((course, index) => (
            <li id={`buddy-option-${index}`} role="option" aria-selected={index === active} key={course} onMouseDown={event => event.preventDefault()} onClick={() => chooseCourse(course)}>
              {course}
            </li>
          ))}
          {!options.length && <li role="presentation">No courses found. Try another search.</li>}
        </ul>
      )}
    </div>
  );
}
