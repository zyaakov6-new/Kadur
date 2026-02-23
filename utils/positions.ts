import { PlayerPosition } from '@/types';

export const POSITION_LABELS: Record<PlayerPosition, string> = {
  attack: 'התקפה',
  midfield: 'קישור',
  defense: 'הגנה',
  goalkeeper: 'שוער',
};

export const POSITION_EMOJI: Record<PlayerPosition, string> = {
  attack: '⚡',
  midfield: '🎯',
  defense: '🛡️',
  goalkeeper: '🧤',
};

export function getPositionLabel(position: PlayerPosition): string {
  return POSITION_LABELS[position] ?? position;
}

export function getPositionEmoji(position: PlayerPosition): string {
  return POSITION_EMOJI[position] ?? '⚽';
}
