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
    expect(screen.getByText(/MEM_ALLOC: 0 \/ 4 NODES/)).toBeInTheDocument();
    expect(screen.getByText('0x01')).toBeInTheDocument();
    expect(screen.getByText('0x02')).toBeInTheDocument();
  });
});
