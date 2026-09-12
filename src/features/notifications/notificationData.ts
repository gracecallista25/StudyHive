import type { Student } from '../study-buddy/studentTypes';

export interface Notification {
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

// Fictional preview data. Replace with a notification API when it is available.
export const initialNotifications: Notification[] = [
  { id: 'maya', title: 'Maya Tan wants to join your study group', context: 'CS204 · Data Structures', time: '5 min ago', day: 'Today', unread: true, kind: 'request', name: 'Maya Tan', avatar: 'maya', description: 'Computer Science · Year 2', message: 'I’m working through trees and graphs this week. I’d love to join your group and practise together.' },
  { id: 'alex', title: 'Alex Wu accepted your study request', context: 'Linear Algebra · Study Buddy', time: '28 min ago', day: 'Today', unread: true, kind: 'update', name: 'Alex Wu', avatar: 'alex', description: 'Mathematics · Year 3', message: 'Your study request was accepted. You can now plan your next study session together.' },
  { id: 'lin', title: 'Lin Chen wants to join your study group', context: 'CS204 · Data Structures', time: '1 hour ago', day: 'Today', unread: true, kind: 'request', name: 'Lin Chen', avatar: 'lin', description: 'Computer Science · Year 2', message: 'Could I join your next session? I can bring some practice questions for us to work through.' },
  { id: 'yuna', title: 'Yuna Park joined your study group', context: 'Calculus · Study Groups', time: '4:20 pm', day: 'Yesterday', unread: false, kind: 'update', name: 'Yuna Park', avatar: 'yuna', description: 'Engineering · Year 2', message: 'Your group has a new member. A little company makes a lot of progress.' },
  { id: 'welcome', title: 'Welcome to your StudyHive inbox', context: 'Your campus connections, in one place', time: '10:00 am', day: 'Yesterday', unread: false, kind: 'update', name: 'StudyHive', avatar: 'lin', description: 'HITSZ · Shenzhen', message: 'This is where study requests and group updates will appear. These examples let you try the inbox before the backend is connected.' },
];
