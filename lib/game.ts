"use client";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  emoji: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-idea",
    title: "First Spark",
    description: "Submitted your first idea",
    emoji: "💡",
  },
  {
    id: "idea-machine",
    title: "Idea Machine",
    description: "Submitted 5 ideas",
    emoji: "⚙️",
  },
  {
    id: "first-vote",
    title: "First Vote",
    description: "Cast your first vote",
    emoji: "🗳️",
  },
  {
    id: "power-voter",
    title: "Power Voter",
    description: "Cast 10 votes",
    emoji: "⚡",
  },
  {
    id: "category-explorer",
    title: "Category Explorer",
    description: "Submitted ideas in 3 different categories",
    emoji: "🧭",
  },
  {
    id: "streak-3",
    title: "On a Roll",
    description: "Active 3 days in a row",
    emoji: "🔥",
  },
];

export type PlayerState = {
  points: number;
  ideasSubmitted: number;
  votesCast: number;
  categoriesUsed: string[];
  unlocked: string[];
  lastActiveDate: string | null;
  streak: number;
};

const DEFAULT_STATE: PlayerState = {
  points: 0,
  ideasSubmitted: 0,
  votesCast: 0,
  categoriesUsed: [],
  unlocked: [],
  lastActiveDate: null,
  streak: 0,
};

const STORAGE_KEY = "bank-ideas:player";
const CHANGE_EVENT = "bank-ideas:player-changed";
const GAME_EVENT = "bank-ideas:game-event";

export type GameEvent =
  | { type: "points"; amount: number; reason: string }
  | { type: "achievement"; achievement: Achievement }
  | { type: "levelup"; level: number; title: string };

export type LevelInfo = {
  level: number;
  title: string;
  threshold: number;
  next?: { level: number; title: string; threshold: number };
};

const LEVELS: { level: number; title: string; threshold: number }[] = [
  { level: 1, title: "Idea Newbie", threshold: 0 },
  { level: 2, title: "Idea Enthusiast", threshold: 20 },
  { level: 3, title: "Innovation Ninja", threshold: 50 },
  { level: 4, title: "Idea Champion", threshold: 100 },
  { level: 5, title: "Bank Idea Legend", threshold: 200 },
];

export function getLevel(points: number): LevelInfo {
  let current = LEVELS[0];
  for (const entry of LEVELS) {
    if (points >= entry.threshold) current = entry;
  }
  const next = LEVELS.find((entry) => entry.threshold > points);
  return { ...current, next };
}

let cachedPlayer: PlayerState | null = null;

function readFromStorage(): PlayerState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

// Cached so repeated calls (e.g. useSyncExternalStore's getSnapshot) return a
// stable reference until the state actually changes via savePlayer().
export function loadPlayer(): PlayerState {
  if (!cachedPlayer) {
    cachedPlayer = readFromStorage();
  }
  return cachedPlayer;
}

function savePlayer(state: PlayerState) {
  cachedPlayer = state;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // best-effort only; this is a per-device fun layer, not the source of truth
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function emit(event: GameEvent) {
  window.dispatchEvent(new CustomEvent<GameEvent>(GAME_EVENT, { detail: event }));
}

export function onPlayerChange(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

export function onGameEvent(callback: (event: GameEvent) => void) {
  const handler = (e: Event) => callback((e as CustomEvent<GameEvent>).detail);
  window.addEventListener(GAME_EVENT, handler);
  return () => window.removeEventListener(GAME_EVENT, handler);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function applyStreak(state: PlayerState): PlayerState {
  const now = todayKey();
  if (state.lastActiveDate === now) return state;
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const streak = state.lastActiveDate === yesterday ? state.streak + 1 : 1;
  return { ...state, lastActiveDate: now, streak };
}

function applyAchievements(state: PlayerState): PlayerState {
  const unlocked = new Set(state.unlocked);
  const progress: Record<string, boolean> = {
    "first-idea": state.ideasSubmitted >= 1,
    "idea-machine": state.ideasSubmitted >= 5,
    "first-vote": state.votesCast >= 1,
    "power-voter": state.votesCast >= 10,
    "category-explorer": state.categoriesUsed.length >= 3,
    "streak-3": state.streak >= 3,
  };

  let changed = false;
  for (const achievement of ACHIEVEMENTS) {
    if (progress[achievement.id] && !unlocked.has(achievement.id)) {
      unlocked.add(achievement.id);
      changed = true;
      emit({ type: "achievement", achievement });
    }
  }

  return changed ? { ...state, unlocked: Array.from(unlocked) } : state;
}

function applyPoints(state: PlayerState, amount: number, reason: string): PlayerState {
  const beforeLevel = getLevel(state.points).level;
  const next = { ...state, points: state.points + amount };
  emit({ type: "points", amount, reason });

  const afterLevel = getLevel(next.points);
  if (afterLevel.level > beforeLevel) {
    emit({ type: "levelup", level: afterLevel.level, title: afterLevel.title });
  }
  return next;
}

export function recordIdeaSubmitted(category: string): PlayerState {
  let state = loadPlayer();
  state = applyStreak(state);
  state = {
    ...state,
    ideasSubmitted: state.ideasSubmitted + 1,
    categoriesUsed: state.categoriesUsed.includes(category)
      ? state.categoriesUsed
      : [...state.categoriesUsed, category],
  };
  state = applyPoints(state, 10, "Idea submitted");
  state = applyAchievements(state);
  savePlayer(state);
  return state;
}

let lastVoteAt = 0;
let comboCount = 0;

export function registerVoteCombo(): number {
  const now = Date.now();
  comboCount = now - lastVoteAt < 4000 ? comboCount + 1 : 1;
  lastVoteAt = now;
  return comboCount;
}

export function recordVote(): PlayerState {
  let state = loadPlayer();
  state = applyStreak(state);
  state = { ...state, votesCast: state.votesCast + 1 };
  state = applyPoints(state, 2, "Vote cast");
  state = applyAchievements(state);
  savePlayer(state);
  return state;
}
