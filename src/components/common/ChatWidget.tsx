import React from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { API_CONFIG } from '@/config/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type ChatMessage = {
  id: string;
  room: string;
  text: string;
  senderId?: string;
  senderName?: string;
  createdAt: string | Date;
};

type ChatUser = {
  id: string;
  name: string;
  email: string;
  role: string; // admin|owner|employee|customer
};

const ChatWidget: React.FC = () => {
  const { user, token } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [text, setText] = React.useState('');
  const [users, setUsers] = React.useState<ChatUser[]>([]);
  const [toUserId, setToUserId] = React.useState<string>('');
  const [room, setRoom] = React.useState<string>('general');
  const listRef = React.useRef<HTMLDivElement>(null);
  const [sseStatus, setSseStatus] = React.useState<'connecting' | 'open' | 'error'>('connecting');
  const [mode, setMode] = React.useState<'general' | 'dm'>('general');

  const scrollToBottom = React.useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const loadUsers = React.useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_CONFIG.baseUrl}/chat/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch {}
  }, [user]);

  const loadMessages = React.useCallback(async () => {
    if (!user) return;
    if (mode === 'dm' && !toUserId) return;
    try {
      setLoading(true);
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (toUserId) {
        params.set('toUserId', toUserId);
      } else {
        params.set('room', room);
      }
      const res = await fetch(`${API_CONFIG.baseUrl}/chat/messages?${params.toString()}`, {
        headers: authHeader
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
        setTimeout(scrollToBottom, 0);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user, scrollToBottom, room, toUserId, mode, token]);

  React.useEffect(() => {
    if (!user) return;
    if (!token) return;
    const url = `${API_CONFIG.baseUrl}/chat/stream?token=${encodeURIComponent(token)}`;
    setSseStatus('connecting');
    const es = new EventSource(url);
    es.onopen = () => setSseStatus('open');
    const onChat = (e: MessageEvent) => {
      try {
        const msg = JSON.parse(e.data) as ChatMessage;
        const currentRoom = mode === 'dm'
          ? (toUserId ? dmRoomFor(String(user.id), toUserId) : '__none__')
          : 'general';
        if (msg.room === currentRoom) {
          setMessages(prev => [...prev, msg]);
        }
        setTimeout(scrollToBottom, 0);
      } catch {}
    };
    es.addEventListener('chat', onChat as any);
    es.onerror = () => setSseStatus('error');
    return () => {
      es.removeEventListener('chat', onChat as any);
      es.close();
    };
  }, [user, scrollToBottom, room, toUserId]);

  const sendMessage = async () => {
    const value = text.trim();
    if (!value) return;
    try {
      if (!token) return;
      if (mode === 'dm' && !toUserId) return;
      const res = await fetch(`${API_CONFIG.baseUrl}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ room, toUserId: toUserId || undefined, text: value })
      });
      if (res.ok) {
        setText('');
      }
    } catch {}
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      loadUsers();
      loadMessages();
    }
  };

  const dmRoomFor = (a: string, b: string) => {
    const pair = [String(a), String(b)].sort();
    return `dm:${pair[0]}:${pair[1]}`;
  };

  const onSelectUser = (id: string) => {
    setToUserId(id);
    if (id) {
      if (mode !== 'dm') setMode('dm');
      setRoom(dmRoomFor(String(user?.id || ''), id));
    } else {
      if (mode !== 'general') setMode('general');
      setRoom('general');
    }
    setMessages([]);
    loadMessages();
  };

  const onModeChange = (value: string) => {
    const next = (value === 'dm' ? 'dm' : 'general') as 'general' | 'dm';
    setMode(next);
    if (next === 'general') {
      if (toUserId) setToUserId('');
      setRoom('general');
      setMessages([]);
      loadMessages();
    } else {
      if (toUserId) {
        setRoom(dmRoomFor(String(user?.id || ''), toUserId));
        setMessages([]);
        loadMessages();
      } else {
        setRoom('__none__');
        setMessages([]);
      }
    }
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative hover:bg-slate-50 text-slate-600 hover:text-[#1A3C34] rounded-full" onClick={toggle} aria-label="Open chat">
        <MessageSquare className="h-5 w-5" />
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-slate-900">Team Chat</h4>
              <div className="flex items-center gap-2">
                <ToggleGroup type="single" value={mode} onValueChange={onModeChange} className="bg-slate-100 rounded-lg p-0.5">
                  <ToggleGroupItem value="general" className={`${mode === 'general' ? 'bg-white shadow-sm' : ''} h-7 px-2 text-[11px]`}>
                    #general
                  </ToggleGroupItem>
                  <ToggleGroupItem value="dm" className={`${mode === 'dm' ? 'bg-white shadow-sm' : ''} h-7 px-2 text-[11px]`}>
                    Direct
                  </ToggleGroupItem>
                </ToggleGroup>
                <span className="flex items-center gap-1 text-[11px] text-slate-600">
                  <span
                    className={[
                      'inline-block h-2 w-2 rounded-full',
                      sseStatus === 'open'
                        ? 'bg-emerald-500'
                        : sseStatus === 'connecting'
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-red-500'
                    ].join(' ')}
                    aria-label={sseStatus}
                    title={sseStatus === 'open' ? 'Connected' : sseStatus === 'connecting' ? 'Connecting' : 'Reconnecting'}
                  />
                  <span>
                    {sseStatus === 'open' ? 'Connected' : sseStatus === 'connecting' ? 'Connecting' : 'Reconnecting'}
                  </span>
                </span>
                <div className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {mode === 'dm' ? (toUserId ? 'Direct Message' : 'Direct · Select user') : '#general'}
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-3">
              {mode === 'dm' ? (
                <div className="flex-1">
                  <Select
                    onValueChange={(v) => onSelectUser(v)}
                    value={toUserId || ''}
                  >
                    <SelectTrigger className="h-9 bg-white border-slate-200">
                      <SelectValue placeholder="Select a person…" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="text-xs text-slate-600">Posting to #general</div>
              )}
              {mode === 'dm' && toUserId && (
                <span className="text-[11px] px-2 py-1 rounded bg-slate-200 text-slate-700 uppercase tracking-wide">
                  DM
                </span>
              )}
            </div>
          </div>
          <div ref={listRef} className="max-h-96 overflow-y-auto p-4 space-y-3 bg-white">
            {loading ? (
              <div className="text-xs text-slate-500">Loading…</div>
            ) : messages.length === 0 ? (
              <div className="text-xs text-slate-500">No messages yet</div>
            ) : (
              messages.map(m => {
                const mine = String(m.senderId || '') === String(user?.id || '');
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%]`}>
                      <div className={`text-[11px] mb-1 ${mine ? 'text-right text-slate-500' : 'text-slate-600'}`}>
                        {mine ? 'You' : m.senderName || 'User'} · {new Date(m.createdAt).toLocaleTimeString()}
                      </div>
                      <div className={`px-3 py-2 rounded-lg text-sm leading-relaxed shadow-sm ${mine ? 'bg-[#1A3C34] text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'}`}>
                        {m.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex items-center gap-2 p-3 border-t border-slate-100 bg-white">
            <Input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message…"
              className="h-10 rounded-full bg-slate-50 border-slate-200"
            />
            <Button size="icon" onClick={sendMessage} className="h-10 w-10 rounded-full bg-[#1A3C34] hover:bg-[#122a25]">
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
