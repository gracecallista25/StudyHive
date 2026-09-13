import { Download, FileText, UsersRound } from 'lucide-react';
import { StudentAvatar } from '../../shared/components';
import { people } from './messages';
import type { ChatFile, Conversation } from './messages';

export function ChatAvatar({ chat }: { chat: Conversation }) {
  const person = people.find(item => item.id === chat.members[0]);
  return chat.kind === 'group' || !person
    ? <span className="msg-group-avatar"><UsersRound size={23} /></span>
    : <StudentAvatar variant={person.avatar} />;
}

export function FileLink({ file }: { file: ChatFile }) {
  return <a className="msg-file" href={file.url} download={file.name}>
    <span className="msg-file-icon"><FileText size={21} /></span>
    <span><strong>{file.name}</strong><small>{file.size}</small></span>
    <Download size={17} aria-label="Download" />
  </a>;
}
