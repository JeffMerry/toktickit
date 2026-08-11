import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders TokTickIT title', () => {
    render(<App />);
    expect(screen.getByText(/TokTickIT IT Service Desk/i)).toBeDefined();
  });
});
