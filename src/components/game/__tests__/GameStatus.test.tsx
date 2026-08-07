import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { GameStatus } from '../GameStatus';

describe('GameStatus Component', () => {
  it('renders room ID and connected player count', () => {
    render(
      <GameStatus
        roomId="🐶-🚀-🍎"
        connectedCount={3}
        maxPlayers={4}
        playerName="風之浪人"
      />
    );
    expect(screen.getByText('🐶-🚀-🍎')).toBeInTheDocument();
    expect(screen.getByText('3/4 人席')).toBeInTheDocument();
  });
});
