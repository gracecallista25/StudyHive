export type Person = { id: string; name: string; avatar: 'lin' | 'maya' | 'alex' | 'yuna'; detail: string };
export type ChatFile = { name: string; size: string; url: string };
export type ChatMessage = { id: string; sender: string; text: string; time: string; file?: ChatFile };
export type Conversation = { id: string; name: string; kind: 'personal' | 'group'; members: string[]; unread: number; description: string; pinned?: string; messages: ChatMessage[] };
export const messagesConnected = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());

async function messageRequest(path: string, method = 'GET', body?: unknown) {
  const base = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');
  const response = await fetch(base + path, { method, signal: AbortSignal.timeout(15000),
    ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.status !== 'success') throw new Error(data?.reason || 'The message request failed.');
  return data;
}

type ApiConversation = { id: string; type: 'personal' | 'group'; name: string | null; members: { id: string; full_name: string; major: string }[]; last_message: { from_user_id: string; text: string; created_at: string } | null };
function readConversation(item: ApiConversation, userId: string): Conversation {
  const others = item.members.filter(member => member.id !== userId);
  const last = item.last_message;
  return { id: item.id, name: item.name || others.map(member => member.full_name).join(', '), kind: item.type,
    members: others.map(member => member.id), unread: 0, description: others[0] ? `${others[0].major} · StudyHive` : 'A StudyHive conversation.',
    messages: last ? [{ id: `${item.id}-last`, sender: last.from_user_id === userId ? 'you' : last.from_user_id, text: last.text, time: new Date(last.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] : [] };
}
export async function loadConversations(userId: string, query = '') {
  const suffix = query ? '?search=' + encodeURIComponent(query) : '';
  const data = await messageRequest('/conversations/' + encodeURIComponent(userId) + suffix);
  return (data.conversations as ApiConversation[]).map(item => readConversation(item, userId));
}
export async function loadMessages(conversationId: string, userId: string) {
  const data = await messageRequest('/conversations/' + encodeURIComponent(conversationId) + '/messages?viewer_id=' + encodeURIComponent(userId));
  return (data.messages as { from_user_id: string; text: string; created_at: string; id?: string }[]).map(message => ({ id: message.id || crypto.randomUUID(), sender: message.from_user_id === userId ? 'you' : message.from_user_id, text: message.text, time: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
}
export async function postMessage(conversationId: string, userId: string, text: string) {
  await messageRequest('/conversations/' + encodeURIComponent(conversationId) + '/messages', 'POST', { from_user_id: userId, text });
}
export async function createConversation(userId: string, type: 'personal' | 'group', memberIds: string[], name?: string) {
  const data = await messageRequest('/conversations', 'POST', { creator_id: userId, type, member_ids: memberIds, ...(name ? { name } : {}) });
  return readConversation(data.conversation as ApiConversation, userId);
}
export const people: Person[] = [
  { id: 'lin', name: 'Lin Chen', avatar: 'lin', detail: 'Computer Science · Year 2' },
  { id: 'maya', name: 'Maya Tan', avatar: 'maya', detail: 'Design · Year 2' },
  { id: 'alex', name: 'Alex Wu', avatar: 'alex', detail: 'Computer Science · Year 3' },
  { id: 'yuna', name: 'Yuna Kim', avatar: 'yuna', detail: 'Mathematics · Year 2' },
];
const notes: ChatFile = { name: 'Algorithms notes.txt', size: 'Study notes', url: 'data:text/plain;charset=utf-8,' + encodeURIComponent('Algorithms Circle — practice notes\n\n1. Trace breadth-first search using a queue.\n2. Compare BFS and DFS traversal orders.\n3. Explain why a visited set prevents cycles.\n4. Discuss time complexity: O(V + E).\n') };
export const initialConversations: Conversation[] = [
  { id: 'personal-lin', name: 'Lin Chen', kind: 'personal', members: ['lin'], unread: 0, description: people[0].detail, messages: [
    { id: 'l1', sender: 'lin', text: 'Hey! Are you free to review the algorithms assignment?', time: '14:20' },
    { id: 'l2', sender: 'lin', text: 'I’m stuck on the dynamic programming question.', time: '14:21' },
    { id: 'l3', sender: 'you', text: 'Yes! Let’s work through it together.', time: '14:22' },
    { id: 'l4', sender: 'lin', text: 'These are the notes I’ve put together so far.', time: '14:23', file: notes },
    { id: 'l5', sender: 'you', text: 'Library, second floor at 3?', time: '14:31' },
    { id: 'l6', sender: 'lin', text: 'Perfect. See you there!', time: '14:32' },
  ] },
  { id: 'group-algorithms', name: 'Algorithms Circle', kind: 'group', members: ['maya', 'alex', 'lin', 'yuna'], unread: 2, description: 'A space to solve, share, and study together.', pinned: 'Practice session: Friday, 4 PM · Library, Floor 2', messages: [
    { id: 'g1', sender: 'maya', text: 'I’ve uploaded the practice notes for Friday.', time: '10:12', file: notes },
    { id: 'g2', sender: 'alex', text: 'Can we start with graph traversal?', time: '10:16' },
    { id: 'g3', sender: 'lin', text: 'Yes, I can walk everyone through BFS.', time: '10:20' },
    { id: 'g4', sender: 'you', text: 'I’ll bring a few challenge problems too.', time: '10:24' },
  ] },
  { id: 'personal-maya', name: 'Maya Tan', kind: 'personal', members: ['maya'], unread: 2, description: people[1].detail, messages: [{ id: 'm1', sender: 'maya', text: 'Got it! I’ll share my notes later.', time: '11:24' }] },
  { id: 'personal-alex', name: 'Alex Wu', kind: 'personal', members: ['alex'], unread: 1, description: people[2].detail, messages: [{ id: 'a1', sender: 'alex', text: 'Are you joining the project meeting tomorrow?', time: '10:18' }] },
  { id: 'group-design', name: 'Design Sprint Team', kind: 'group', members: ['maya', 'alex'], unread: 0, description: 'Small ideas. Thoughtful experiments. Better campus experiences.', pinned: 'Bring one sketch to our next catch-up.', messages: [{ id: 'd1', sender: 'maya', text: 'The new wireframes are ready for a look. What do you think?', time: '09:45' }] },
  { id: 'personal-yuna', name: 'Yuna Kim', kind: 'personal', members: ['yuna'], unread: 0, description: people[3].detail, messages: [{ id: 'y1', sender: 'yuna', text: 'These past papers are really helpful. Thank you!', time: '09:10' }] },
  { id: 'group-calculus', name: 'Calculus Study Room', kind: 'group', members: ['yuna', 'lin'], unread: 0, description: 'Making sense of maths, one problem at a time.', messages: [{ id: 'c1', sender: 'yuna', text: 'Anyone up for a quick revision session this weekend?', time: '08:30' }] },
];
export const storageKey = 'studyhive.messages.preview.v1';
export function readConversations(): Conversation[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!Array.isArray(value) || !value.length || value.length > 100) return initialConversations;
    const valid = value.every(c => c && typeof c.id === 'string' && typeof c.name === 'string' && ['personal', 'group'].includes(c.kind) && typeof c.description === 'string' && typeof c.unread === 'number' && (c.pinned === undefined || typeof c.pinned === 'string') && Array.isArray(c.members) && c.members.every((id: unknown) => people.some(p => p.id === id)) && Array.isArray(c.messages) && c.messages.every((m: ChatMessage) => m && typeof m.id === 'string' && typeof m.text === 'string' && typeof m.time === 'string' && (m.sender === 'you' || people.some(p => p.id === m.sender)) && (!m.file || typeof m.file.name === 'string' && typeof m.file.size === 'string' && typeof m.file.url === 'string' && m.file.url.startsWith('data:'))));
    return valid ? value as Conversation[] : initialConversations;
  } catch { return initialConversations; }
}


export function saveConversations(conversations: Conversation[]) {
  localStorage.setItem(storageKey, JSON.stringify(conversations));
}

export function filterConversations(conversations: Conversation[], filter: string, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  return conversations.filter(conversation =>
    (filter === 'all' || conversation.kind === filter) && conversation.name.toLowerCase().includes(normalizedQuery),
  );
}

export function countUnreadConversations(conversations: Conversation[]) {
  return conversations.filter(conversation => conversation.unread > 0).length;
}
