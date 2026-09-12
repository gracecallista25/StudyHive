import { majorsByDegree } from '../auth/registrationOptions';
import type { ListingSearchFilters } from './studyBuddyApi';

const majors = [...new Set(Object.values(majorsByDegree).flat())].sort();

interface ListingSearchFieldsProps {
  filters: ListingSearchFilters;
  onChange: (filters: ListingSearchFilters) => void;
}

export function ListingSearchFields({ filters, onChange }: ListingSearchFieldsProps) {
  function updateFilter(key: keyof ListingSearchFilters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="buddy-search-grid">
      <label>
        Major
        <select aria-label="Major" value={filters.major} onChange={event => updateFilter('major', event.target.value)}>
          <option value="">Any major</option>
          {majors.map(major => <option key={major} value={major}>{major}</option>)}
        </select>
      </label>
      <label>Date<input type="date" value={filters.date} onChange={event => updateFilter('date', event.target.value)} /></label>
      <label>Start time<input type="time" value={filters.start_time} onChange={event => updateFilter('start_time', event.target.value)} /></label>
      <label>End time<input type="time" value={filters.end_time} onChange={event => updateFilter('end_time', event.target.value)} /></label>
      <label className="buddy-search-location">
        Location
        <input type="text" placeholder="Any location, e.g. Library" value={filters.location} onChange={event => updateFilter('location', event.target.value)} />
      </label>
      <p className="buddy-note buddy-search-location">These filters are optional. Enter both times to find sessions that overlap your time range.</p>
    </div>
  );
}
