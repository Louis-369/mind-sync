import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Card } from '../Card';

describe('Card Component', () => {
  it('renders card value correctly', () => {
    render(<Card value={42} flipped={true} />);
    const elements = screen.getAllByText('42');
    expect(elements.length).toBeGreaterThan(0);
  });

  it('renders seal stamp when showSeal is true', () => {
    render(<Card value={15} showSeal={true} />);
    expect(screen.getByText('確')).toBeInTheDocument();
  });

  it('adds underline for numbers 6, 9, 66, 99 to prevent confusion', () => {
    render(<Card value={6} flipped={true} />);
    const elements = screen.getAllByText('6');
    expect(elements[0].className).toContain('border-b');
  });
});
