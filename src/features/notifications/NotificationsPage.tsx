import { useState } from 'react';
import { ArrowRight, Bell, Check, CheckCheck, Inbox, X } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { StudentAvatar } from '../study-buddy/StudentAvatar';
import { initialNotifications } from './notificationData';
import type { Notification } from './notificationData';
import './notifications.css';

type Filter = 'All' | 'Unread' | 'Requests';
const filters: Filter[] = ['All', 'Unread', 'Requests'];

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<Filter>('All');
  const [selectedId, setSelectedId] = useState<string | null>('maya');
  const [feedback, setFeedback] = useState('');

  const unreadCount = notifications.filter(item => item.unread).length;
  const selected = notifications.find(item => item.id === selectedId);
  const visible = notifications.filter(item => {
    if (filter === 'Unread') return item.unread;
    if (filter === 'Requests') return item.kind === 'request';
    return true;
  });

  function openNotification(id: string) {
    setSelectedId(id);
    setNotifications(items => items.map(item => item.id === id ? { ...item, unread: false } : item));
  }

  function markAllRead() {
    setNotifications(items => items.map(item => ({ ...item, unread: false })));
    setFeedback('All notifications marked as read.');
  }

  function decideRequest(id: string, outcome: 'accepted' | 'declined') {
    setNotifications(items => items.map(item => item.id === id ? { ...item, outcome, unread: false } : item));
    setFeedback(`Request ${outcome} in this preview. No real membership was changed.`);
  }

  function requestActions(item: Notification) {
    if (item.kind !== 'request') return null;
    if (item.outcome) return <span className="notification-outcome"><Check size={15} aria-hidden="true" />{item.outcome === 'accepted' ? 'Accepted' : 'Declined'}</span>;
    return (
      <div className="notification-actions" aria-label={`Respond to ${item.name}`}>
        <Button onClick={() => decideRequest(item.id, 'accepted')} aria-label={`Accept ${item.name}'s request`}>Accept</Button>
        <button className="notification-secondary" onClick={() => decideRequest(item.id, 'declined')} aria-label={`Decline ${item.name}'s request`}>Decline</button>
      </div>
    );
  }

  return (
    <div className="page-content notifications-page">
      <p className="breadcrumb">Campus <span>/</span><strong>Notifications</strong></p>
      <header className="notifications-header">
        <div><h1>Notifications</h1><p>Your people. Your plans. All caught up.</p></div>
        <button className="notification-text-button" onClick={markAllRead} disabled={unreadCount === 0}><CheckCheck size={19} aria-hidden="true" />Mark all as read</button>
      </header>
      <p className="notifications-preview"><Bell size={15} aria-hidden="true" /><span>Interactive preview · Fictional updates. Changes reset when you leave this page.</span></p>

      <div className="notifications-layout">
        <section className="notifications-inbox" aria-label="Notification inbox">
          <div className="notification-filters" role="group" aria-label="Filter notifications">
            {filters.map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}{value === 'Unread' && <span>{unreadCount}</span>}</button>)}
          </div>
          {visible.length === 0 ? (
            <div className="notifications-empty"><Inbox size={34} aria-hidden="true" /><h2>You’re all caught up.</h2><p>No unread notifications. A little peace before your next connection.</p><button className="notification-text-button" onClick={() => setFilter('All')}>View all notifications <ArrowRight size={17} aria-hidden="true" /></button></div>
          ) : (['Today', 'Yesterday'] as const).map(day => {
            const items = visible.filter(item => item.day === day);
            if (items.length === 0) return null;
            return <section className="notification-day" key={day} aria-label={day}>
              <h2>{day}</h2>
              <ul>{items.map(item => (
                <li key={item.id} className={'notification-row' + (item.unread ? ' is-unread' : '') + (selectedId === item.id ? ' is-selected' : '')}>
                  <button className="notification-summary" onClick={() => openNotification(item.id)} aria-pressed={selectedId === item.id}>
                    <span className="notification-dot" aria-label={item.unread ? 'Unread' : 'Read'} />
                    <StudentAvatar variant={item.avatar} />
                    <span className="notification-copy"><strong>{item.title}</strong><span>{item.context}</span><small>{item.time}</small></span>
                  </button>
                  {requestActions(item)}
                </li>
              ))}</ul>
            </section>;
          })}
          <p className="notification-feedback" role="status">{feedback}</p>
        </section>

        {selected && <aside className="notification-detail" aria-label="Notification details">
          <div className="notification-detail-heading"><span>{selected.kind === 'request' ? 'Study group request' : 'Your update'}</span><button className="icon-button" aria-label="Close notification details" onClick={() => setSelectedId(null)}><X size={17} /></button></div>
          <StudentAvatar variant={selected.avatar} />
          <h2>{selected.name}</h2><p className="notification-person-meta">{selected.description}</p>
          <div className="notification-detail-message"><h3>{selected.kind === 'request' ? 'Message' : 'What’s new'}</h3><p>{selected.message}</p></div>
          <div className="notification-context"><h3>{selected.kind === 'request' ? 'Wants to join' : 'About'}</h3><p>{selected.context}</p></div>
          {requestActions(selected)}
          <p className="notification-detail-note">Preview only · No messages or requests are sent.</p>
        </aside>}
      </div>
      <footer className="notifications-footer">Same campus. <em>Brighter together.</em></footer>
    </div>
  );
}
