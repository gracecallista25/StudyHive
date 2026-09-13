import type { Student } from '../study-buddy/studyBuddy';

export interface Notification {
  requestType?: 'study_buddy' | 'study_group';
  picture?: string;
  id: string;
  title: string;
  context: string;
  time: string;
  day: 'Today' | 'Yesterday';
  unread: boolean;
  kind: 'request' | 'update';
  name: string;
  avatar: Student['avatar'];
  description: string;
  message: string;
  outcome?: 'accepted' | 'declined';
}

export const notificationsConnected = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());

async function inboxRequest(path: string, body?: unknown) {
  const base = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');
  const response = await fetch(base + path, {
    method: body === undefined ? 'GET' : 'POST', signal: AbortSignal.timeout(15000),
    ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  });
  if (!response.ok) throw new Error('The request inbox could not be reached. Please try again.');
  const data = await response.json();
  if (data.status !== 'success') throw new Error(data.reason || 'The request could not be confirmed.');
  return data;
}

interface InboxRequest {
  request_id: string; type: 'study_buddy' | 'study_group';
  from_user: { full_name: string; major: string; grade: number; profile_picture: string };
  listing?: { course: string; date: string; start_time: string; end_time: string; location: string };
  group?: { course: string; date: string; start_time: string; end_time: string; location: string };
}

export async function loadNotifications(userId: string): Promise<Notification[]> {
  const data = await inboxRequest('/requests/' + encodeURIComponent(userId));
  return (data.requests as InboxRequest[]).map(request => {
    const session = request.type === 'study_buddy' ? request.listing! : request.group!;
    const name = request.from_user.full_name;
    return { id: request.request_id, requestType: request.type, picture: request.from_user.profile_picture,
      title: name + (request.type === 'study_buddy' ? ' wants to study with you' : ' wants to join your study group'),
      context: session.course, time: 'Pending', day: 'Today', unread: true, kind: 'request', name, avatar: 'lin',
      description: request.from_user.major + ' · Year ' + request.from_user.grade,
      message: `${session.date} · ${session.start_time}–${session.end_time} · ${session.location}` };
  });
}

export async function respondToNotification(notification: Notification, outcome: 'accepted' | 'declined') {
  const prefix = notification.requestType === 'study_group' ? '/group-requests/' : '/requests/';
  await inboxRequest(prefix + encodeURIComponent(notification.id) + '/respond', { action: outcome === 'accepted' ? 'accept' : 'decline' });
}

// Fictional preview data. Replace with a notification API when it is available.
export const initialNotifications: Notification[] = [
  { id: 'maya', title: 'Maya Tan wants to join your study group', context: 'CS204 · Data Structures', time: '5 min ago', day: 'Today', unread: true, kind: 'request', name: 'Maya Tan', avatar: 'maya', description: 'Computer Science · Year 2', message: 'I’m working through trees and graphs this week. I’d love to join your group and practise together.' },
  { id: 'alex', title: 'Alex Wu accepted your study request', context: 'Linear Algebra · Study Buddy', time: '28 min ago', day: 'Today', unread: true, kind: 'update', name: 'Alex Wu', avatar: 'alex', description: 'Mathematics · Year 3', message: 'Your study request was accepted. You can now plan your next study session together.' },
  { id: 'lin', title: 'Lin Chen wants to join your study group', context: 'CS204 · Data Structures', time: '1 hour ago', day: 'Today', unread: true, kind: 'request', name: 'Lin Chen', avatar: 'lin', description: 'Computer Science · Year 2', message: 'Could I join your next session? I can bring some practice questions for us to work through.' },
  { id: 'yuna', title: 'Yuna Park joined your study group', context: 'Calculus · Study Groups', time: '4:20 pm', day: 'Yesterday', unread: false, kind: 'update', name: 'Yuna Park', avatar: 'yuna', description: 'Engineering · Year 2', message: 'Your group has a new member. A little company makes a lot of progress.' },
  { id: 'welcome', title: 'Welcome to your StudyHive inbox', context: 'Your campus connections, in one place', time: '10:00 am', day: 'Yesterday', unread: false, kind: 'update', name: 'StudyHive', avatar: 'lin', description: 'HITSZ · Shenzhen', message: 'This is where study requests and group updates will appear. These examples let you try the inbox before the backend is connected.' },
];



