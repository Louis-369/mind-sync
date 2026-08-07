import { describe, it, expect } from 'vitest';
import { generateSeededDeck, buildRoomId, reconstructPlayerHand } from '../gameLogic';

describe('gameLogic module', () => {
  it('buildRoomId creates standard emoji room string', () => {
    expect(buildRoomId('🐶', '🚀', '🍎')).toBe('🐶-🚀-🍎');
  });

  it('generateSeededDeck produces a deterministic 100-card deck for the same seed', () => {
    const seed = 'test-seed-123';
    const deck1 = generateSeededDeck(seed);
    const deck2 = generateSeededDeck(seed);

    expect(deck1.length).toBe(100);
    expect(deck2.length).toBe(100);
    expect(deck1).toEqual(deck2);

    // Verify all numbers 1..100 exist
    const sorted = [...deck1].sort((a, b) => a - b);
    expect(sorted).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
  });

  it('generateSeededDeck produces different decks for different seeds', () => {
    const deckA = generateSeededDeck('room-A');
    const deckB = generateSeededDeck('room-B');
    expect(deckA).not.toEqual(deckB);
  });

  it('reconstructPlayerHand deals sorted cards and filters placed cards', () => {
    const seed = 'room-test';
    const handPlayer0 = reconstructPlayerHand(seed, 0, 5);
    const handPlayer1 = reconstructPlayerHand(seed, 1, 5);

    expect(handPlayer0.length).toBe(5);
    expect(handPlayer1.length).toBe(5);

    // Hand should be sorted ascending
    expect([...handPlayer0]).toEqual([...handPlayer0].sort((a, b) => a - b));

    // Player 0 and Player 1 should get distinct cards
    const set0 = new Set(handPlayer0);
    handPlayer1.forEach((card) => {
      expect(set0.has(card)).toBe(false);
    });

    // Test filtering placed cards
    const placedValue = handPlayer0[0];
    const filteredHand = reconstructPlayerHand(seed, 0, 5, new Set([placedValue]));
    expect(filteredHand.length).toBe(4);
    expect(filteredHand.includes(placedValue)).toBe(false);
  });
});
