import { useState } from 'react';
import { safePicture } from './pictureUrl';
export function ProfilePortrait({ name, source }: { name: string; source: string }) {
  const [failedSource, setFailedSource] = useState('');
  const src = safePicture(source);
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  return <div className="profile-portrait">{src && failedSource !== src
    ? <img src={src} alt={name + "'s profile picture"} referrerPolicy="no-referrer" onError={() => setFailedSource(src)}/>
    : <span aria-label={name + "'s initials"}>{initials || 'SH'}</span>}</div>;
}
