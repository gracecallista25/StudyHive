import { useEffect, useState } from 'react';
import { readConversations, storageKey } from './messages';
import './unreadChatBadge.css';

export function UnreadChatBadge() {
  const [count, setCount] = useState(() => readConversations().filter(chat => chat.unread > 0).length);
  useEffect(() => {
    function refresh() { setCount(readConversations().filter(chat => chat.unread > 0).length); }
    function onChange(event: Event) { setCount((event as CustomEvent<number>).detail); }
    function onStorage(event: StorageEvent) { if (event.key === storageKey || event.key === null) refresh(); }
    refresh();
    window.addEventListener('studyhive:unread-chats', onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('studyhive:unread-chats', onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  return count > 0 ? <span className="unread-chat-badge" aria-label={`${count} unopened ${count === 1 ? 'chat' : 'chats'}`} aria-live="polite">{count > 99 ? '99+' : count}</span> : null;
}


