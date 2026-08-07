import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PlayerHand } from '../PlayerHand';

describe('PlayerHand Component', () => {
  it('renders player name and card count', () => {
    render(
      <PlayerHand
        hand={[10, 20, 30]}
        playerName="風之浪人"
        onPlayCard={() => {}}
      />
    );
    expect(screen.getByText('風之浪人')).toBeInTheDocument();
    expect(screen.getByText('3 張手牌')).toBeInTheDocument();
  });

  it('triggers onPlayCard when a card is clicked', () => {
    const handlePlayCard = vi.fn();
    render(
      <PlayerHand
        hand={[25]}
        playerName="浪人"
        onPlayCard={handlePlayCard}
      />
    );
    const cardElements = screen.getAllByText('25');
    fireEvent.click(cardElements[0]);
    expect(handlePlayCard).toHaveBeenCalledWith(25);
  });

  it('renders empty hand message when hand is empty', () => {
    render(
      <PlayerHand
        hand={[]}
        playerName="浪人"
        onPlayCard={() => {}}
      />
    );
    expect(screen.getByText(/手牌已完全出完/)).toBeInTheDocument();
  });
});
