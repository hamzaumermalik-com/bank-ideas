"use client";

import { useSyncExternalStore } from "react";
import { loadPlayer, onPlayerChange, type PlayerState } from "./game";

const SERVER_STATE: PlayerState = {
  points: 0,
  ideasSubmitted: 0,
  votesCast: 0,
  categoriesUsed: [],
  unlocked: [],
  lastActiveDate: null,
  streak: 0,
};

function getServerSnapshot(): PlayerState {
  return SERVER_STATE;
}

export function usePlayer(): PlayerState {
  return useSyncExternalStore(onPlayerChange, loadPlayer, getServerSnapshot);
}
