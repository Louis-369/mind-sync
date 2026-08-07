import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBoardState } from '../useBoardState';
import { BoardCard } from '../../types/game';

describe('useBoardState hook', () => {
  it('calculates totalSlotsCount based on players and cardsPerPlayer', () => {
    const { result } = renderHook(() => useBoardState([], 2, 3));
    expect(result.current.totalSlotsCount).toBe(6);
  });

  it('clamps totalSlotsCount between 2 and 12', () => {
    const { result: low } = renderHook(() => useBoardState([], 1, 1));
    expect(low.current.totalSlotsCount).toBe(2);

    const { result: high } = renderHook(() => useBoardState([], 4, 10));
    expect(high.current.totalSlotsCount).toBe(12);
  });

  it('maps board cards correctly into slots and evaluates correctness on flip', () => {
    const cards: BoardCard[] = [
      { uniqueKey: '1', slotId: 'slot-0', cardValue: 20, playerId: 'p1', playerName: 'Player 1', placedAt: 1, flipped: true },
      { uniqueKey: '2', slotId: 'slot-1', cardValue: 10, playerId: 'p2', playerName: 'Player 2', placedAt: 2, flipped: true },
    ];

    const { result } = renderHook(() => useBoardState(cards, 2, 1, 'playing'));

    expect(result.current.slotsMap['slot-0']).toHaveLength(1);
    expect(result.current.slotsMap['slot-1']).toHaveLength(1);

    // slot-0 has cardValue 20, slot-1 has cardValue 10.
    // Order from left to right should be ascending (10 then 20).
    // So slot-0 (20) at index 0 should be false (because 10 should be at index 0).
    expect(result.current.slotCorrectnessMap['slot-0']).toBe(false);
    expect(result.current.slotCorrectnessMap['slot-1']).toBe(false);
  });

  it('evaluates slotCorrectnessMap as true when cards are placed in correct ascending order', () => {
    const cards: BoardCard[] = [
      { uniqueKey: '1', slotId: 'slot-0', cardValue: 15, playerId: 'p1', playerName: 'Player 1', placedAt: 1, flipped: true },
      { uniqueKey: '2', slotId: 'slot-2', cardValue: 42, playerId: 'p2', playerName: 'Player 2', placedAt: 2, flipped: true },
    ];

    const { result } = renderHook(() => useBoardState(cards, 2, 1, 'finished'));

    expect(result.current.slotCorrectnessMap['slot-0']).toBe(true);
    expect(result.current.slotCorrectnessMap['slot-1']).toBe(true);
    expect(result.current.isFinishedReveal).toBe(true);
  });
});
