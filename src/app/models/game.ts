export interface Game {
  gameId: number;
  igdbId: number;
  gameTitle: string;
  releaseDate: string;
  description: string;
  imageUrl: string;
  status?: GameStatus;
  score?: number | null;
  updatedAt?: string;
  genres: string[];
  platforms: string[];
}

export type GameStatus =
  | 'None'
  | 'Wishlist'
  | 'Owned'
  | 'Playing'
  | 'Completed'
  | 'Abandoned';
