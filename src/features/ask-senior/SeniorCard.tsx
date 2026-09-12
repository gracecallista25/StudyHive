import { ArrowRight } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { StudentAvatar } from '../study-buddy/StudentAvatar';
import type { Senior } from './seniorData';

interface SeniorCardProps {
  senior: Senior;
  onView: () => void;
  onAsk: () => void;
}

export function SeniorCard({ senior, onView, onAsk }: SeniorCardProps) {
  return (
    <article className="senior-card">
      <StudentAvatar variant={senior.avatar} />
      <div className="senior-card-info">
        <div className="senior-card-heading">
          <h3>{senior.name}</h3>
          <span className={'senior-availability' + (senior.available ? '' : ' is-away')}>
            {senior.available ? 'Available to help' : 'Not available'}
          </span>
        </div>
        <p className="senior-meta">{senior.major} · Year {senior.year}</p>
        <p className="senior-summary">{senior.summary}</p>
        <div className="senior-tags">
          {senior.tags.map(tag => <span key={tag}>{tag}</span>)}
        </div>
      </div>
      <div className="senior-card-actions">
        <button className="senior-text-button" onClick={onView} aria-label={`View ${senior.name}'s profile`}>
          View profile <ArrowRight size={17} aria-hidden="true" />
        </button>
        <Button onClick={onAsk} disabled={!senior.available} aria-label={`Ask ${senior.name} a question`}>
          Ask a question
        </Button>
      </div>
    </article>
  );
}
