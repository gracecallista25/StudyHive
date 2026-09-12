import { Clock, MapPin, UsersRound } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import type { StudyGroup } from './groupApi';

interface GroupCardProps {
  group: StudyGroup;
  userId: string | null;
  pending: boolean;
  sent: boolean;
  onJoin: () => void;
  onRefresh: () => void;
  onCancel: () => void;
}

export function GroupCard({
  group,
  userId,
  pending,
  sent,
  onJoin,
  onRefresh,
  onCancel,
}: GroupCardProps) {
  const isMember = group.members.some(person => person.id === userId);
  const isFull = group.member_count >= group.max_members || group.status === 'full';
  const seatsAvailable = group.max_members - group.member_count;
  const capacityPercent = Math.min(100, (group.member_count / group.max_members) * 100);

  function getRoomState() {
    if (group.status === 'cancelled') return 'Room cancelled';
    if (isFull) return 'Room full';
    return `${seatsAvailable} seats available`;
  }

  function getJoinLabel() {
    if (sent) return 'Request sent';
    if (isFull) return 'Room full';
    return 'Request to join';
  }

  return (
    <article className="group-card">
      <div className="group-card-top">
        <span className="group-icon"><UsersRound size={26} /></span>
        <span className="group-seats">{group.member_count} / {group.max_members} members</span>
      </div>

      <h2>{group.course}</h2>
      <p className="group-host">Hosted by {group.created_by.full_name}</p>
      <div
        className="group-capacity"
        role="meter"
        aria-label="Room capacity"
        aria-valuemin={0}
        aria-valuemax={group.max_members}
        aria-valuenow={group.member_count}
      >
        <span style={{ width: `${capacityPercent}%` }} />
      </div>
      <p className="group-state">{getRoomState()}</p>

      <p className="group-detail"><Clock size={17} />{group.date} · {group.start_time}–{group.end_time}</p>
      <p className="group-detail"><MapPin size={17} />{group.location}</p>
      {group.notes && <p className="group-notes">{group.notes}</p>}

      <details>
        <summary>Members ({group.member_count})</summary>
        <ul>
          {group.members.map(person => (
            <li key={person.id}>{person.full_name}{person.id === group.created_by.id ? ' · Host' : ''}</li>
          ))}
        </ul>
      </details>

      <div className="group-card-actions">
        {group.status !== 'cancelled' && (
          isMember ? <span>You’re a member</span> : !userId ? <a href="#login">Log in to request a seat</a> : (
            <Button disabled={pending || sent || isFull} onClick={onJoin}>{getJoinLabel()}</Button>
          )
        )}
        <button className="reset-link" disabled={pending} onClick={onRefresh}>Refresh room</button>
        {group.created_by.id === userId && group.status !== 'cancelled' && (
          <button className="reset-link" disabled={pending} onClick={onCancel}>Cancel room</button>
        )}
      </div>
    </article>
  );
}
