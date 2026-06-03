import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizCard } from '../QuizCard';

const sampleQuiz = {
  id: 'test-1',
  title: 'JavaScript Basics',
  description: 'Test your JS knowledge!',
};

describe('QuizCard', () => {
  it('renders the quiz title', () => {
    render(<QuizCard quiz={sampleQuiz} onStart={() => {}} />);
    expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
  });

  it('renders the quiz description', () => {
    render(<QuizCard quiz={sampleQuiz} onStart={() => {}} />);
    expect(screen.getByText('Test your JS knowledge!')).toBeInTheDocument();
  });

  it('renders a Start Quiz button', () => {
    render(<QuizCard quiz={sampleQuiz} onStart={() => {}} />);
    expect(screen.getByText('Start Quiz')).toBeInTheDocument();
  });

  it('calls onStart with quiz id when button is clicked', () => {
    const onStart = vi.fn();
    render(<QuizCard quiz={sampleQuiz} onStart={onStart} />);
    fireEvent.click(screen.getByText('Start Quiz'));
    expect(onStart).toHaveBeenCalledWith('test-1');
  });
});
