import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultSummary } from '../ResultSummary';

describe('ResultSummary', () => {
  it('renders the score fraction', () => {
    render(<ResultSummary score={3} total={5} percentage={60} feedback="Good job!" />);
    expect(screen.getByText('3/5 — 60%')).toBeInTheDocument();
  });

  it('renders "Excellent!" badge for 80%+', () => {
    render(<ResultSummary score={4} total={5} percentage={80} feedback="Great!" />);
    expect(screen.getByText('Excellent!')).toBeInTheDocument();
  });

  it('renders "Keep practicing" badge for 50-79%', () => {
    render(<ResultSummary score={3} total={5} percentage={60} feedback="Keep it up!" />);
    expect(screen.getByText('Keep practicing')).toBeInTheDocument();
  });

  it('renders "Needs review" badge for under 50%', () => {
    render(<ResultSummary score={1} total={5} percentage={20} feedback="Try again!" />);
    expect(screen.getByText('Needs review')).toBeInTheDocument();
  });

  it('renders the feedback text', () => {
    render(<ResultSummary score={3} total={5} percentage={60} feedback="You answered 3 out of 5 questions correctly." />);
    expect(screen.getByText('You answered 3 out of 5 questions correctly.')).toBeInTheDocument();
  });

  it('renders "Quiz Complete!" heading', () => {
    render(<ResultSummary score={5} total={5} percentage={100} feedback="Perfect!" />);
    expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
  });
});
