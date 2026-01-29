import { Game } from "./game";


export interface UserProfile {
  displayName: string;
  avatarUrl: string;
  createdAt: string;
  gameCollection: Game[];
}