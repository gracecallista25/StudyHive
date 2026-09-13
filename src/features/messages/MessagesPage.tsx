import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, FileText, Info, MessageCircle, Paperclip, Pin, Search, Send, SquarePen, X } from 'lucide-react';
import { StudentAvatar } from '../../shared/components';
import { countUnreadConversations, filterConversations, people, readConversations, saveConversations, messagesConnected, loadConversations, loadMessages, postMessage, createConversation, type ChatFile, type Conversation } from './messages';
import { ChatAvatar, FileLink } from './MessageComponents';
import './messages.css';

export function MessagesPage({ userId }: { userId: string | null }) {
  const [chats, setChats] = useState<Conversation[]>(messagesConnected && userId ? [] : readConversations);
  const [activeId, setActiveId] = useState(() => chats[0]?.id || '');
  const [backendLoading, setBackendLoading] = useState(messagesConnected && !!userId);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<Record<string, ChatFile | undefined>>({});
  const [details, setDetails] = useState(false);
  const [detailsTab, setDetailsTab] = useState('members');
  const [mobileChat, setMobileChat] = useState(false);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [loadingFile, setLoadingFile] = useState(false);
  const [newKind, setNewKind] = useState('personal');
  const [newName, setNewName] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const messageEnd = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const chat = chats.find(c => c.id === activeId) || chats[0] || { id: '', name: 'Messages', kind: 'personal' as const, members: [], unread: 0, description: '', messages: [] };
  const draft = drafts[chat.id] || '';
  const attachment = attachments[chat.id];
  const visible = filterConversations(chats, filter, query);
  const sharedFiles = chat.messages.flatMap(m => m.file ? [m.file] : []);
  useEffect(() => {
    if (!messagesConnected || !userId) return;
    let active = true;
    setBackendLoading(true);
    loadConversations(userId, query).then(items => { if (active) { setChats(items); if (!activeId && items[0]) setActiveId(items[0].id); } })
      .catch(reason => { if (active) setSaveError(reason instanceof Error ? reason.message : 'Messages could not be loaded.'); })
      .finally(() => { if (active) setBackendLoading(false); });
    return () => { active = false; };
  }, [userId, query, activeId]);
  useEffect(() => {
    if (!messagesConnected || !userId || !activeId) return;
    loadMessages(activeId, userId).then(messages => setChats(previous => previous.map(item => item.id === activeId ? { ...item, messages } : item))).catch(() => undefined);
  }, [userId, activeId]);
  useEffect(() => {
    if (messagesConnected) return;
    try { saveConversations(chats); setSaveError(''); }
    catch { setSaveError('Browser storage is full or unavailable. New messages will only last for this visit.'); }
    window.dispatchEvent(new CustomEvent('studyhive:unread-chats', { detail: countUnreadConversations(chats) }));
  }, [chats]);
  useEffect(() => { messageEnd.current?.scrollIntoView({ block: 'nearest' }); }, [chat.id, chat.messages.length]);

  useEffect(() => {
    const viewport = window.matchMedia('(min-width: 721px)');
    function markVisibleRead() {
      if (viewport.matches || mobileChat) setChats(previous => previous.map(c => c.id === activeId && c.unread > 0 ? { ...c, unread: 0 } : c));
    }
    markVisibleRead();
    viewport.addEventListener('change', markVisibleRead);
    return () => viewport.removeEventListener('change', markVisibleRead);
  }, [activeId, mobileChat]);

  function openChat(c: Conversation) {
    setActiveId(c.id); setMobileChat(true); setDetails(false); setError(''); setDetailsTab('members');
    setChats(previous => previous.map(item => item.id === c.id ? { ...item, unread: 0 } : item));
  }
  async function sendMessage() {
    if ((!draft.trim() && !attachment) || loadingFile) return;
    const next = { id: crypto.randomUUID(), sender: 'you', text: draft.trim(), time: new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date()), ...(attachment ? { file: attachment } : {}) };
    if (messagesConnected && userId) {
      try { await postMessage(chat.id, userId, draft.trim()); }
      catch (reason) { setError(reason instanceof Error ? reason.message : 'The message could not be sent.'); return; }
    }
    setChats(previous => {
      const updated = { ...chat, messages: [...chat.messages, next] };
      return [updated, ...previous.filter(c => c.id !== chat.id)];
    });
    setDrafts(previous => ({ ...previous, [chat.id]: '' }));
    setAttachments(previous => ({ ...previous, [chat.id]: undefined }));
    setError(''); composer.current?.focus();
  }
  async function attachFile(file?: File) {
    if (!file) return;
    const targetId = chat.id;
    if (file.size > 2 * 1024 * 1024) { setError('Choose a file smaller than 2 MB for this local preview.'); return; }
    setLoadingFile(true); setError('');
    try {
      const url = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.onabort = reject; reader.readAsDataURL(file); });
      setAttachments(previous => ({ ...previous, [targetId]: { name: file.name, size: file.size < 1024 ? `${file.size} B` : `${Math.ceil(file.size / 1024)} KB`, url } }));
    } catch { setError('This file could not be attached. Please try again.'); }
    finally { setLoadingFile(false); if (fileInput.current) fileInput.current.value = ''; }
  }
  async function createChat() {
    if (!selectedPeople.length || (newKind === 'group' && !newName.trim())) return;
    if (messagesConnected && userId) {
      try {
        const created = await createConversation(userId, newKind as 'personal' | 'group', selectedPeople, newKind === 'group' ? newName.trim() : undefined);
        setChats(previous => [created, ...previous.filter(item => item.id !== created.id)]); setActiveId(created.id); setMobileChat(true); dialog.current?.close();
      } catch (reason) { setError(reason instanceof Error ? reason.message : 'The conversation could not be created.'); }
      return;
    }
    if (newKind === 'personal') {
      const existing = chats.find(c => c.kind === 'personal' && c.members[0] === selectedPeople[0]);
      if (existing) { setFilter('all'); setQuery(''); openChat(existing); dialog.current?.close(); return; }
    }
    const person = people.find(p => p.id === selectedPeople[0])!;
    const next: Conversation = { id: crypto.randomUUID(), kind: newKind as Conversation['kind'], name: newKind === 'group' ? newName.trim() : person.name, members: selectedPeople, unread: 0, description: newKind === 'group' ? 'Your new study space. Start a conversation together.' : person.detail, messages: [] };
    setChats(previous => [next, ...previous]); setFilter('all'); setQuery(''); setActiveId(next.id); setMobileChat(true); setDetails(false); setError(''); dialog.current?.close();
  }

  return <section className="messages-page" aria-label="Messages">
    <header className="msg-page-header"><div><div className="breadcrumb"><a href="#home">Home</a><ChevronRight size={13} /><strong>Messages</strong></div><h1>Messages</h1><p>A little conversation. A brighter connection.</p></div><button className="button msg-new" aria-label="New message" onClick={() => { setSelectedPeople([]); setNewName(''); setNewKind('personal'); dialog.current?.showModal(); }}><SquarePen size={18} /><span>New message</span></button></header>
    <div className="msg-preview"><span><span className="msg-preview-dot" />{messagesConnected ? 'Connected inbox' : 'Local preview'}</span><p>{messagesConnected ? 'Conversations and messages come from StudyHive.' : 'Sample conversations · Messages stay in this browser.'}</p></div>
    {saveError && <p role="alert" className="msg-error">{saveError}</p>}
    {backendLoading && <p role="status" className="msg-loading">Loading conversations...</p>}
    <div className={`msg-workspace${mobileChat ? ' msg-mobile-chat' : ''}${details ? ' msg-with-details' : ''}`}>
      <aside className="msg-inbox" aria-label="Conversations"><div className="msg-inbox-tools"><label className="msg-search"><Search size={18} /><input aria-label="Search messages" placeholder="Search messages" value={query} onChange={e => setQuery(e.target.value)} />{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={14} /></button>}</label><div className="msg-filters" aria-label="Filter conversations">{['all', 'personal', 'group'].map(f => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f === 'group' ? 'Groups' : f === 'all' ? 'All' : 'Personal'}</button>)}</div></div>
        <div className="msg-conversation-list">{visible.map(c => { const last = c.messages.at(-1); return <button key={c.id} className={`msg-conversation${chat.id === c.id ? ' is-active' : ''}`} aria-current={chat.id === c.id ? 'true' : undefined} onClick={() => openChat(c)}><ChatAvatar chat={c} /><span className="msg-conversation-copy"><span className="msg-conversation-top"><strong>{c.name}</strong><time>{last?.time}</time></span><span className="msg-conversation-bottom"><span>{last ? `${last.sender === 'you' ? 'You: ' : ''}${last.text || last.file?.name || ''}` : 'Start a conversation'}</span>{c.unread > 0 && <b aria-label={`${c.unread} unread messages`}>{c.unread}</b>}</span>{c.kind === 'group' && <small>{c.members.length + 1} members</small>}</span></button>; })}{!visible.length && <div className="msg-empty"><Search size={27} /><h3>No conversations found</h3><p>Try another name or filter.</p><button onClick={() => { setQuery(''); setFilter('all'); }}>Clear filters</button></div>}</div><div className="msg-inbox-footer"><MessageCircle size={16} /><span>Same campus. Closer together.</span></div>
      </aside>
      <section className="msg-chat" aria-label={`Conversation with ${chat.name}`}><header className="msg-chat-header"><button className="msg-icon msg-back" aria-label="Back to conversations" onClick={() => { setMobileChat(false); setDetails(false); }}><ArrowLeft size={20} /></button><ChatAvatar chat={chat} /><div><h2>{chat.name}</h2><p>{chat.kind === 'group' ? `${chat.members.length + 1} members · Study group` : chat.description}</p></div><button className={`msg-icon msg-info${details ? ' is-active' : ''}`} aria-label="Conversation details" aria-expanded={details} onClick={() => setDetails(!details)}><Info size={21} /></button></header>
        {chat.pinned && <div className="msg-pinned"><Pin size={15} /><strong>Pinned</strong><span>{chat.pinned}</span></div>}
        <div className="msg-history" role="log" aria-label="Message history" aria-live="polite"><div className="msg-date"><span>Conversation</span></div>{chat.messages.length === 0 && <div className="msg-start"><span className="msg-group-avatar"><MessageCircle size={28} /></span><h3>Good conversations start here.</h3><p>Say hello to {chat.name}.</p></div>}{chat.messages.map(m => { const person = people.find(p => p.id === m.sender); return <div key={m.id} className={`msg-message${m.sender === 'you' ? ' is-own' : ''}`}>{person && <StudentAvatar variant={person.avatar} />}<div className="msg-message-content">{chat.kind === 'group' && person && <strong className="msg-sender">{person.name}</strong>}<div className="msg-bubble">{m.text && <p>{m.text}</p>}{m.file && <FileLink file={m.file} />}</div><div className="msg-message-meta"><time>{m.time}</time>{m.sender === 'you' && <span><Check size={12} />Saved locally</span>}</div></div></div>; })}<div ref={messageEnd} /></div>
        <form className="msg-composer" onSubmit={e => { e.preventDefault(); sendMessage(); }}>{error && <p role="alert" className="msg-error">{error}</p>}{attachment && <div className="msg-pending"><FileText size={17} /><span>{attachment.name}</span><button type="button" className="msg-icon" aria-label="Remove attachment" onClick={() => setAttachments(previous => ({ ...previous, [chat.id]: undefined }))}><X size={16} /></button></div>}<div className="msg-composer-row"><input type="file" ref={fileInput} hidden aria-label="Attach file" onChange={e => void attachFile(e.target.files?.[0])} /><button type="button" className="msg-icon" aria-label="Attach a file" disabled={loadingFile} onClick={() => fileInput.current?.click()}><Paperclip size={21} /></button><textarea ref={composer} aria-label={`Message ${chat.name}`} placeholder={`Message ${chat.name}…`} rows={1} maxLength={4000} value={draft} onChange={e => setDrafts(previous => ({ ...previous, [chat.id]: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); sendMessage(); } }} /><button className="button msg-send" aria-label="Send" type="submit" disabled={(!draft.trim() && !attachment) || loadingFile}><span>Send</span><Send size={17} /></button></div><div className="msg-composer-hint"><span>{loadingFile ? 'Attaching file…' : 'Enter to send · Shift + Enter for a new line'}</span><span>{draft.length}/4000</span></div></form>
      </section>
      {details && <aside className="msg-details" aria-label="Conversation details panel"><div className="msg-details-heading"><h3>{chat.kind === 'group' ? 'Group details' : 'Contact details'}</h3><button className="msg-icon" aria-label="Close details" onClick={() => setDetails(false)}><X size={19} /></button></div><div className="msg-details-profile"><ChatAvatar chat={chat} /><h3>{chat.name}</h3><p>{chat.description}</p></div><div className="msg-details-tabs">{['members', 'shared'].map(t => <button key={t} aria-pressed={detailsTab === t} onClick={() => setDetailsTab(t)}>{t === 'members' ? chat.kind === 'group' ? 'Members' : 'About' : 'Shared files'}</button>)}</div>{detailsTab === 'members' ? <div className="msg-members">{chat.members.map((id, i) => { const p = people.find(person => person.id === id)!; return <div key={id}><StudentAvatar variant={p.avatar} /><span>{p.name}</span>{i === 0 && chat.kind === 'group' && <small>Admin</small>}</div>; })}{chat.kind === 'group' && <div><span className="msg-you">Y</span><span>You</span></div>}{chat.kind === 'personal' && <p className="msg-detail-note">Part of your StudyHive community.</p>}</div> : <div className="msg-shared">{sharedFiles.length ? sharedFiles.map((file, index) => <FileLink key={index} file={file} />) : <div className="msg-empty"><FileText size={26} /><p>No shared files yet.</p></div>}</div>}<div className="msg-details-bottom"><span>Better together.</span><p>Make room for your next good idea.</p><ArrowRight size={22} /></div></aside>}
    </div>
    <dialog className="msg-dialog" ref={dialog}><form onSubmit={e => { e.preventDefault(); createChat(); }}><div className="msg-details-heading"><h2>Start a conversation</h2><button className="msg-icon" type="button" aria-label="Close new message" onClick={() => dialog.current?.close()}><X size={20} /></button></div><p>Bring a classmate into the conversation.</p><div className="msg-filters">{['personal', 'group'].map(k => <button key={k} type="button" aria-pressed={newKind === k} onClick={() => { setNewKind(k); setSelectedPeople([]); }}>{k === 'personal' ? 'Personal chat' : 'Group chat'}</button>)}</div>{newKind === 'group' && <label className="msg-name-label">Group name<input value={newName} onChange={e => setNewName(e.target.value)} maxLength={60} placeholder="e.g. Friday Study Circle" required /></label>}<fieldset><legend>{newKind === 'group' ? 'Choose members' : 'Choose a classmate'}</legend>{people.map(p => <label key={p.id}><StudentAvatar variant={p.avatar} /><span><strong>{p.name}</strong><small>{p.detail}</small></span><input type={newKind === 'personal' ? 'radio' : 'checkbox'} name="recipient" checked={selectedPeople.includes(p.id)} onChange={() => setSelectedPeople(previous => newKind === 'personal' ? [p.id] : previous.includes(p.id) ? previous.filter(id => id !== p.id) : [...previous, p.id])} /></label>)}</fieldset><p className="msg-detail-note">Creates a local preview conversation. No invitations are sent.</p><button className="button msg-create" disabled={!selectedPeople.length || (newKind === 'group' && !newName.trim())}>{newKind === 'group' ? 'Create group' : 'Open conversation'}<ArrowRight size={17} /></button></form></dialog>
  </section>;
}





