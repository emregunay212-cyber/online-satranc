export interface User {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
  isGuest?: boolean;
}

export interface GameState {
  id: string;
  white: string; // uid
  black: string | null; // uid, null if waiting
  whiteName: string;
  blackName: string | null;
  whitePhoto: string | null;
  blackPhoto: string | null;
  fen: string;
  moves: string[]; // move history in SAN notation
  status: 'waiting' | 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'resigned';
  turn: 'w' | 'b';
  winner: string | null; // uid of winner
  createdAt: number;
  updatedAt: number;
}

export interface LobbyRoom {
  id: string;
  hostUid: string;
  hostName: string;
  hostPhoto: string | null;
  createdAt: number;
  status: 'waiting' | 'playing';
}

export interface ChatMessage {
  id: string;
  uid: string;
  name: string;
  text: string;
  timestamp: number;
}

export interface UserStats {
  uid: string;
  displayName: string;
  photoURL: string | null;
  wins: number;
  losses: number;
  draws: number;
  rating: number;
}

export interface GameHistory {
  id: string;
  whiteUid: string;
  blackUid: string;
  whiteName: string;
  blackName: string;
  moves: string[];
  result: 'white' | 'black' | 'draw';
  winnerName: string | null;
  date: number;
  moveCount: number;
}
