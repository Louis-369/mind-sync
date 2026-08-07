import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { GameBoard } from '../GameBoard';

describe('GameBoard Component', () => {
  it('renders slot grid and card counters', () => {
    render(
      <GameBoard
        board={[]}
        currentConnectionId="p1"
        status="playing"
        totalPlayers={2}
        cardsPerPlayer={2}
      />
    );
    expect(screen.getByText(/已落牌 0 \/ 4 張/)).toBeInTheDocument();
    expect(screen.getByText('壹')).toBeInTheDocument();
    expect(screen.getByText('貳')).toBeInTheDocument();
  });
});
