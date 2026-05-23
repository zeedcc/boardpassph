import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Copy, Check, LogOut, Crown, Play, ChevronRight,
  Loader2, Radio, BookOpen, RotateCcw, Trophy, Wifi, WifiOff
} from 'lucide-react';
import { UserProfile, Question } from '../types';
import { db } from '../firebase';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

// ── Types ──────────────────────────────────────────────────────────────────

interface Participant {
  email: string;
  username: string;
  score: number;
  answeredIndex: number | null;
}

interface RoomDoc {
  roomCode: string;
  roomName: string;
  hostEmail: string;
  participants: Participant[];
  currentQuestionIndex: number;
  totalQuestions: number;
  status: 'waiting' | 'active' | 'reveal' | 'finished';
  currentQuestion: Question | null;
  createdAt: unknown;
}

interface GroupStudyPanelProps {
  profile: UserProfile;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function genRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];
const TOTAL_QUESTIONS = 10;
const CATEGORY_OPTIONS = [
  { value: 'mixed', label: 'Mixed Topics' },
  { value: 'assessment', label: 'Psychological Assessment' },
  { value: 'abnormal', label: 'Abnormal / DSM-5' },
  { value: 'developmental', label: 'Developmental Psych' },
  { value: 'industrial', label: 'Industrial / I-O Psych' },
];

// ── Component ──────────────────────────────────────────────────────────────

export function GroupStudyPanel({ profile }: GroupStudyPanelProps) {
  // Lobby state
  const [phase, setPhase] = useState<'lobby' | 'room'>('lobby');
  const [lobbyMode, setLobbyMode] = useState<'create' | 'join'>('create');
  const [roomNameInput, setRoomNameInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('mixed');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [lobbyError, setLobbyError] = useState('');
  const [lobbyLoading, setLobbyLoading] = useState(false);

  // Room state
  const [roomId, setRoomId] = useState('');
  const [roomData, setRoomData] = useState<RoomDoc | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const unsubRef = useRef<(() => void) | null>(null);

  const myUsername = profile.username || profile.email.split('@')[0];

  // ── Firestore listener ─────────────────────────────────────────────────

  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(db, 'groupRooms', roomId);
    setConnectionError(false);

    const unsub = onSnapshot(
      roomRef,
      (snap) => {
        if (snap.exists()) {
          setRoomData(snap.data() as RoomDoc);
          setConnectionError(false);
        } else {
          setConnectionError(true);
        }
      },
      (err) => {
        console.error('onSnapshot error:', err);
        setConnectionError(true);
      }
    );

    unsubRef.current = unsub;
    return () => unsub();
  }, [roomId]);

  // Reset selected answer when question index changes
  useEffect(() => {
    setSelectedAnswer(null);
    setAdvancing(false);
  }, [roomData?.currentQuestionIndex, roomData?.status]);

  // ── Lobby actions ──────────────────────────────────────────────────────

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNameInput.trim()) { setLobbyError('Enter a room name.'); return; }
    setLobbyError('');
    setLobbyLoading(true);
    try {
      const code = genRoomCode();
      const newRoom: RoomDoc = {
        roomCode: code,
        roomName: roomNameInput.trim(),
        hostEmail: profile.email,
        participants: [{ email: profile.email, username: myUsername, score: 0, answeredIndex: null }],
        currentQuestionIndex: 0,
        totalQuestions: TOTAL_QUESTIONS,
        status: 'waiting',
        currentQuestion: null,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'groupRooms', code), newRoom);
      setRoomId(code);
      setPhase('room');
    } catch (err) {
      console.error(err);
      setLobbyError('Could not create room. Check your connection.');
    } finally {
      setLobbyLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) { setLobbyError('Enter a room code.'); return; }
    setLobbyError('');
    setLobbyLoading(true);
    try {
      const roomRef = doc(db, 'groupRooms', code);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) { setLobbyError('Room not found. Check the code.'); setLobbyLoading(false); return; }

      const data = snap.data() as RoomDoc;
      if (data.status === 'finished') { setLobbyError('This session has already ended.'); setLobbyLoading(false); return; }

      const alreadyIn = data.participants.some(p => p.email === profile.email);
      if (!alreadyIn) {
        const updated = [...data.participants, { email: profile.email, username: myUsername, score: 0, answeredIndex: null }];
        await updateDoc(roomRef, { participants: updated });
      }
      setRoomId(code);
      setPhase('room');
    } catch (err) {
      console.error(err);
      setLobbyError('Could not join room. Check your connection.');
    } finally {
      setLobbyLoading(false);
    }
  };

  // ── Room actions ───────────────────────────────────────────────────────

  const isHost = roomData?.hostEmail === profile.email;

  const fetchAndStoreQuestion = async (roomRef: ReturnType<typeof doc>, idx: number) => {
    const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';
    const categoryMap: Record<string, string> = {
      mixed: 'DSM-5 psychopathology, psychological assessment, developmental psychology, and I/O psychology',
      assessment: 'psychological assessment, psychometrics, test construction',
      abnormal: 'DSM-5, abnormal psychology, psychopathology',
      developmental: 'developmental psychology, lifespan development',
      industrial: 'industrial and organizational psychology, HR, workplace behavior',
    };
    const focusArea = categoryMap[categoryInput] || categoryMap.mixed;

    try {
      const res = await fetch(`${apiBase}/api/generate-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focusArea, source: 'assessment', difficulty: 'random', model: 'budget' }),
      });
      if (!res.ok) throw new Error('API error');
      const q: Question = await res.json();
      await updateDoc(roomRef, {
        currentQuestion: q,
        currentQuestionIndex: idx,
        status: 'active',
      });
    } catch {
      // Fallback: use a placeholder question
      const fallback: Question = {
        category: 'Psychology',
        vignette: 'Which theoretical framework emphasizes unconscious processes and early childhood experiences as central to personality development?',
        options: ['Behaviorism', 'Psychoanalytic theory', 'Humanistic theory', 'Cognitive theory'],
        correctIndex: 1,
        explanation: 'Psychoanalytic theory (Freud) holds that unconscious drives and early experiences shape adult personality.',
        difficulty: 'medium',
      };
      await updateDoc(roomRef, {
        currentQuestion: fallback,
        currentQuestionIndex: idx,
        status: 'active',
      });
    }
  };

  const handleStartGame = async () => {
    if (!isHost || !roomId) return;
    setAdvancing(true);
    const roomRef = doc(db, 'groupRooms', roomId);
    // Reset all participant scores & answers
    const resetParticipants = (roomData?.participants ?? []).map(p => ({ ...p, score: 0, answeredIndex: null }));
    await updateDoc(roomRef, { participants: resetParticipants });
    await fetchAndStoreQuestion(roomRef, 0);
    setAdvancing(false);
  };

  const handleSubmitAnswer = async (idx: number) => {
    if (!roomId || !roomData || roomData.status !== 'active') return;
    const me = roomData.participants.find(p => p.email === profile.email);
    if (!me || me.answeredIndex !== null) return; // already answered

    setSelectedAnswer(idx);
    const roomRef = doc(db, 'groupRooms', roomId);
    const isCorrect = idx === roomData.currentQuestion?.correctIndex;
    const updated = roomData.participants.map(p =>
      p.email === profile.email
        ? { ...p, answeredIndex: idx, score: p.score + (isCorrect ? 1 : 0) }
        : p
    );

    await updateDoc(roomRef, { participants: updated });

    // If host and everyone answered, auto-reveal
    if (isHost) {
      const allAnswered = updated.every(p => p.answeredIndex !== null);
      if (allAnswered) {
        await updateDoc(roomRef, { status: 'reveal' });
      }
    }
  };

  const handleReveal = async () => {
    if (!isHost || !roomId) return;
    await updateDoc(doc(db, 'groupRooms', roomId), { status: 'reveal' });
  };

  const handleNextQuestion = async () => {
    if (!isHost || !roomId || !roomData) return;
    setAdvancing(true);
    const next = roomData.currentQuestionIndex + 1;
    const roomRef = doc(db, 'groupRooms', roomId);

    if (next >= roomData.totalQuestions) {
      await updateDoc(roomRef, { status: 'finished' });
    } else {
      const resetParticipants = roomData.participants.map(p => ({ ...p, answeredIndex: null }));
      await updateDoc(roomRef, { participants: resetParticipants });
      await fetchAndStoreQuestion(roomRef, next);
    }
    setAdvancing(false);
  };

  const handleLeaveRoom = () => {
    unsubRef.current?.();
    setRoomId('');
    setRoomData(null);
    setPhase('lobby');
    setJoinCodeInput('');
    setSelectedAnswer(null);
  };

  const handleCopyCode = () => {
    if (!roomData) return;
    navigator.clipboard.writeText(roomData.roomCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Derived ────────────────────────────────────────────────────────────

  const me = roomData?.participants.find(p => p.email === profile.email);
  const sortedParticipants = roomData ? [...roomData.participants].sort((a, b) => b.score - a.score) : [];
  const totalAnswered = roomData?.participants.filter(p => p.answeredIndex !== null).length ?? 0;

  // ══════════════════════════════════════════════════════════════════════
  // RENDER: LOBBY
  // ══════════════════════════════════════════════════════════════════════

  if (phase === 'lobby') {
    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-gradient-to-br from-pine to-pine-mid rounded-2xl p-5 text-cream flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-mint" />
          </div>
          <div>
            <h2 className="font-display text-2xl leading-none">Group Study</h2>
            <p className="text-xs text-mint/70 mt-1 font-mono">Live-synced collaborative review rooms</p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 p-1 bg-pine/10 border border-pine/15 rounded-xl">
          {(['create', 'join'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => { setLobbyMode(mode); setLobbyError(''); }}
              className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                lobbyMode === mode ? 'bg-pine text-cream shadow' : 'text-pine/60 hover:text-pine'
              }`}
            >
              {mode === 'create' ? 'Create Room' : 'Join Room'}
            </button>
          ))}
        </div>

        {/* Forms */}
        <div className="bg-white rounded-2xl border border-pine/10 shadow-sm p-5">
          {lobbyMode === 'create' ? (
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-pine/60 tracking-wider block font-mono">
                  Room Name
                </label>
                <input
                  type="text"
                  value={roomNameInput}
                  onChange={e => setRoomNameInput(e.target.value)}
                  placeholder="e.g. MMSE Study Group"
                  className="w-full bg-foam border border-pine/15 text-xs font-semibold text-pine placeholder-pine/30 px-4 py-2.5 rounded-xl outline-none focus:border-mint focus:ring-4 focus:ring-mint/10 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-pine/60 tracking-wider block font-mono">
                  Question Category
                </label>
                <select
                  value={categoryInput}
                  onChange={e => setCategoryInput(e.target.value)}
                  className="w-full bg-foam border border-pine/15 text-xs font-semibold text-pine px-4 py-2.5 rounded-xl outline-none focus:border-mint focus:ring-4 focus:ring-mint/10 transition-all cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="bg-mint/10 border border-mint/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-mint/70 shrink-0" />
                <p className="text-[10px] text-pine/60 font-mono">{TOTAL_QUESTIONS} questions · AI-generated · live synced</p>
              </div>
              {lobbyError && <p className="text-xs text-red-500 font-medium">{lobbyError}</p>}
              <button
                type="submit"
                disabled={lobbyLoading}
                className="w-full py-3 bg-pine text-cream font-black uppercase tracking-widest text-xs rounded-xl shadow-md border-b-2 border-pine/50 hover:brightness-110 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {lobbyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Create Room
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-pine/60 tracking-wider block font-mono">
                  Room Code
                </label>
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={e => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. AB3X7Q"
                  maxLength={6}
                  className="w-full bg-foam border border-pine/15 text-sm font-black text-pine placeholder-pine/30 px-4 py-2.5 rounded-xl outline-none focus:border-mint focus:ring-4 focus:ring-mint/10 transition-all tracking-[0.3em] text-center uppercase"
                />
              </div>
              {lobbyError && <p className="text-xs text-red-500 font-medium">{lobbyError}</p>}
              <button
                type="submit"
                disabled={lobbyLoading}
                className="w-full py-3 bg-mint text-pine font-black uppercase tracking-widest text-xs rounded-xl shadow-md border-b-2 border-emerald-700 hover:brightness-105 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {lobbyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                Join Room
              </button>
            </form>
          )}
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-pine/10 p-5 space-y-3">
          <p className="text-[10px] uppercase font-black text-pine/50 tracking-widest font-mono">How It Works</p>
          {[
            { icon: '🏠', text: 'Host creates a room and shares the 6-character code' },
            { icon: '👥', text: 'Reviewees join with the code — everyone syncs instantly' },
            { icon: '🧠', text: 'AI generates 10 questions; everyone answers simultaneously' },
            { icon: '🏆', text: 'Scores update live — leaderboard reveals after each round' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
              <p className="text-xs text-pine/60 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // RENDER: ROOM (waiting / active / reveal / finished)
  // ══════════════════════════════════════════════════════════════════════

  if (!roomData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        {connectionError ? (
          <>
            <WifiOff className="w-8 h-8 text-red-400" />
            <p className="text-sm text-pine/60 font-medium">Connection lost</p>
            <button onClick={handleLeaveRoom} className="text-xs text-mint font-bold hover:underline">Back to lobby</button>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 text-mint animate-spin" />
            <p className="text-sm text-pine/60 font-medium">Syncing with study group...</p>
          </>
        )}
      </div>
    );
  }

  // ── Room header ──────────────────────────────────────────────────────

  const RoomHeader = () => (
    <div className="bg-gradient-to-br from-pine to-pine-mid rounded-2xl p-4 text-cream flex items-center gap-3 shadow-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-2 h-2 rounded-full ${connectionError ? 'bg-red-400' : 'bg-mint animate-pulse'}`} />
          <span className="text-[9px] uppercase tracking-widest font-bold text-mint/70 font-mono">
            {connectionError ? 'Disconnected' : 'Live'}
          </span>
        </div>
        <h2 className="font-display text-xl leading-none truncate">{roomData.roomName}</h2>
        <p className="text-[10px] text-cream/50 mt-0.5 font-mono">
          Q {roomData.currentQuestionIndex + 1}/{roomData.totalQuestions} ·{' '}
          {roomData.status === 'waiting' ? 'Waiting for host' :
           roomData.status === 'active' ? 'In progress' :
           roomData.status === 'reveal' ? 'Reviewing' : 'Finished'}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-bold font-mono tracking-wider transition cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {roomData.roomCode}
        </button>
        <button
          onClick={handleLeaveRoom}
          className="p-2 bg-red-900/40 hover:bg-red-900/60 border border-red-500/20 text-red-300 rounded-xl transition cursor-pointer"
          title="Leave room"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // ── Participants list ────────────────────────────────────────────────

  const ParticipantsList = ({ compact = false }: { compact?: boolean }) => (
    <div className={`bg-white rounded-2xl border border-pine/10 shadow-sm ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase font-black text-pine/50 tracking-widest font-mono flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-mint" />
          Reviewers ({roomData.participants.length})
        </p>
        {roomData.status === 'active' && (
          <span className="text-[9px] font-bold text-pine/40 font-mono">{totalAnswered}/{roomData.participants.length} answered</span>
        )}
      </div>
      <div className="space-y-1.5">
        {sortedParticipants.map((p, rank) => {
          const isMe = p.email === profile.email;
          const isRoomHost = p.email === roomData.hostEmail;
          const hasAnswered = p.answeredIndex !== null;
          return (
            <div
              key={p.email}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                isMe ? 'bg-mint/10 border border-mint/20' : 'bg-foam/60'
              }`}
            >
              <span className={`text-[10px] font-black font-mono w-4 shrink-0 ${rank === 0 ? 'text-yellow-500' : 'text-pine/30'}`}>
                {rank === 0 ? '👑' : `#${rank + 1}`}
              </span>
              <span className={`text-xs font-bold flex-1 truncate ${isMe ? 'text-pine' : 'text-pine/70'}`}>
                {p.username}{isMe && ' (you)'}{isRoomHost && <Crown className="w-3 h-3 inline ml-1 text-yellow-500" />}
              </span>
              <span className="text-[10px] font-mono text-pine/50 shrink-0">{p.score} pts</span>
              {roomData.status === 'active' && (
                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  hasAnswered ? 'bg-mint text-pine' : 'bg-pine/10'
                }`}>
                  {hasAnswered ? <Check className="w-2.5 h-2.5" /> : null}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── WAITING ──────────────────────────────────────────────────────────

  if (roomData.status === 'waiting') {
    return (
      <div className="space-y-4">
        <RoomHeader />
        <div className="bg-white rounded-2xl border border-pine/10 p-5 text-center space-y-3">
          <div className="w-14 h-14 bg-mint/10 border border-mint/20 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-7 h-7 text-mint" />
          </div>
          <div>
            <p className="text-sm font-black text-pine uppercase tracking-wide">Waiting for Host</p>
            <p className="text-xs text-pine/50 mt-1">Share the code above — host starts when ready</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-pine/40">
            <Loader2 className="w-3 h-3 animate-spin" />
            Listening for room updates...
          </div>
        </div>
        <ParticipantsList />
        {isHost && (
          <button
            onClick={handleStartGame}
            disabled={advancing}
            className="w-full py-3.5 bg-mint text-pine font-black uppercase tracking-widest text-xs rounded-xl shadow-md border-b-2 border-emerald-700 hover:brightness-105 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {advancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Start Game ({roomData.participants.length} player{roomData.participants.length !== 1 ? 's' : ''})
          </button>
        )}
      </div>
    );
  }

  // ── FINISHED ─────────────────────────────────────────────────────────

  if (roomData.status === 'finished') {
    const winner = sortedParticipants[0];
    return (
      <div className="space-y-4">
        <RoomHeader />
        <div className="bg-gradient-to-br from-pine to-pine-mid rounded-2xl p-6 text-center text-cream space-y-3 shadow-lg">
          <Trophy className="w-10 h-10 text-yellow-400 mx-auto" />
          <div>
            <p className="text-[10px] uppercase font-black text-mint/60 tracking-widest font-mono">Session Complete</p>
            <p className="font-display text-2xl mt-1">
              {winner?.email === profile.email ? 'You won! 🎉' : `${winner?.username} wins!`}
            </p>
          </div>
        </div>

        {/* Final scoreboard */}
        <div className="bg-white rounded-2xl border border-pine/10 p-4 space-y-2">
          <p className="text-[10px] uppercase font-black text-pine/50 tracking-widest font-mono mb-3">Final Scoreboard</p>
          {sortedParticipants.map((p, rank) => (
            <div key={p.email} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${p.email === profile.email ? 'bg-mint/10 border border-mint/20' : 'bg-foam/60'}`}>
              <span className="text-base w-6 shrink-0 text-center">
                {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank + 1}`}
              </span>
              <span className="flex-1 text-sm font-bold text-pine truncate">{p.username}{p.email === profile.email ? ' (you)' : ''}</span>
              <span className="text-sm font-black text-pine font-mono">{p.score}/{roomData.totalQuestions}</span>
              <span className="text-[10px] text-pine/40 font-mono">{Math.round((p.score / roomData.totalQuestions) * 100)}%</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {isHost && (
            <button
              onClick={handleStartGame}
              disabled={advancing}
              className="py-3 bg-pine text-cream font-black uppercase tracking-wider text-xs rounded-xl border-b-2 border-pine/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 hover:brightness-110 transition"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
          )}
          <button
            onClick={handleLeaveRoom}
            className={`py-3 border border-pine/20 text-pine/60 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-pine/5 transition ${isHost ? '' : 'col-span-2'}`}
          >
            <LogOut className="w-4 h-4" /> Leave Room
          </button>
        </div>
      </div>
    );
  }

  // ── ACTIVE / REVEAL ───────────────────────────────────────────────────

  const q = roomData.currentQuestion;
  if (!q) {
    return (
      <div className="space-y-4">
        <RoomHeader />
        <div className="flex items-center justify-center py-12 gap-2 text-pine/50">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading question...</span>
        </div>
        <ParticipantsList compact />
      </div>
    );
  }

  const isReveal = roomData.status === 'reveal';
  const myAnswer = me?.answeredIndex ?? selectedAnswer;
  const hasAnswered = myAnswer !== null;
  const correctIdx = q.correctIndex;

  return (
    <div className="space-y-4">
      <RoomHeader />

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-pine/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-mint rounded-full transition-all duration-700"
            style={{ width: `${((roomData.currentQuestionIndex + 1) / roomData.totalQuestions) * 100}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-pine/40 shrink-0">
          {roomData.currentQuestionIndex + 1} / {roomData.totalQuestions}
        </span>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-pine/10 shadow-sm p-5">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-pine flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen className="w-4 h-4 text-mint" />
          </div>
          <p className="text-sm text-pine font-medium leading-relaxed flex-1">{q.vignette}</p>
        </div>

        <div className="space-y-2.5">
          {q.options.map((opt, idx) => {
            let btnClass = 'border-pine/15 bg-foam/60 text-pine hover:border-pine/30 hover:bg-foam cursor-pointer';
            if (isReveal) {
              if (idx === correctIdx) btnClass = 'border-mint bg-mint/10 text-pine font-bold cursor-default';
              else if (idx === myAnswer && idx !== correctIdx) btnClass = 'border-red-400/50 bg-red-50 text-red-600 cursor-default';
              else btnClass = 'border-pine/10 bg-foam/40 text-pine/40 cursor-default';
            } else if (hasAnswered) {
              btnClass = idx === myAnswer
                ? 'border-mint bg-mint/10 text-pine font-bold cursor-default'
                : 'border-pine/10 bg-foam/40 text-pine/40 cursor-default';
            }

            return (
              <button
                key={idx}
                onClick={() => !hasAnswered && !isReveal && handleSubmitAnswer(idx)}
                disabled={hasAnswered || isReveal}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all text-xs ${btnClass}`}
              >
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 border ${
                  isReveal && idx === correctIdx ? 'bg-mint border-mint text-pine' :
                  isReveal && idx === myAnswer && idx !== correctIdx ? 'bg-red-400 border-red-400 text-white' :
                  !isReveal && idx === myAnswer ? 'bg-mint border-mint text-pine' :
                  'bg-pine/5 border-pine/15 text-pine/50'
                }`}>
                  {OPTION_LABELS[idx]}
                </span>
                <span className="flex-1 leading-snug">{opt}</span>
                {isReveal && idx === correctIdx && <Check className="w-4 h-4 text-mint shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Explanation (reveal only) */}
        {isReveal && q.explanation && (
          <div className="mt-4 bg-mint/8 border border-mint/20 rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase font-black text-mint/70 tracking-wider font-mono mb-1">Explanation</p>
            <p className="text-xs text-pine/70 leading-relaxed">{q.explanation}</p>
          </div>
        )}
      </div>

      {/* Waiting indicator (answered, awaiting reveal) */}
      {!isReveal && hasAnswered && (
        <div className="bg-mint/10 border border-mint/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-mint animate-spin shrink-0" />
          <p className="text-xs text-pine/60 font-medium">
            Answer locked in! Waiting for others… ({totalAnswered}/{roomData.participants.length} done)
          </p>
        </div>
      )}

      {/* Participants compact */}
      <ParticipantsList compact />

      {/* Host controls */}
      {isHost && (
        <div className="flex gap-3">
          {!isReveal && (
            <button
              onClick={handleReveal}
              disabled={advancing}
              className="flex-1 py-3 bg-pine/80 text-cream font-black uppercase tracking-wider text-xs rounded-xl border-b-2 border-pine/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 hover:bg-pine transition"
            >
              Reveal Answers
            </button>
          )}
          {isReveal && (
            <button
              onClick={handleNextQuestion}
              disabled={advancing}
              className="flex-1 py-3 bg-mint text-pine font-black uppercase tracking-wider text-xs rounded-xl border-b-2 border-emerald-700 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 hover:brightness-105 transition"
            >
              {advancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
              {roomData.currentQuestionIndex + 1 >= roomData.totalQuestions ? 'Finish Session' : 'Next Question'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
