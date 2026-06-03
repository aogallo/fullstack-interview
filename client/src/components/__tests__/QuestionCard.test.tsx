import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCard } from '../QuestionCard';
import type { Question } from '../../types';

const sampleQuestion: Question = {
  id: 1,
  question: 'What is the capital of France?',
  options: ['London', 'Paris', 'Berlin', 'Madrid'],
  correctAnswer: 1,
  explanation: 'Paris is the capital of France.',
};

describe('QuestionCard', () => {
  it('renders the question text', () => {
    render(
      <QuestionCard
        question={sampleQuestion}
        selectedAnswer={null}
        showFeedback={false}
        onAnswer={() => {}}
      />,
    );
    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
  });

  it('renders all option buttons', () => {
    render(
      <QuestionCard
        question={sampleQuestion}
        selectedAnswer={null}
        showFeedback={false}
        onAnswer={() => {}}
      />,
    );
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Berlin')).toBeInTheDocument();
    expect(screen.getByText('Madrid')).toBeInTheDocument();
  });

  it('calls onAnswer when an option is clicked', () => {
    const onAnswer = vi.fn();
    render(
      <QuestionCard
        question={sampleQuestion}
        selectedAnswer={null}
        showFeedback={false}
        onAnswer={onAnswer}
      />,
    );
    fireEvent.click(screen.getByText('Paris'));
    expect(onAnswer).toHaveBeenCalledWith(1);
  });

  it('disables options after selection', () => {
    render(
      <QuestionCard
        question={sampleQuestion}
        selectedAnswer={1}
        showFeedback={false}
        onAnswer={() => {}}
      />,
    );
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it('highlights correct answer in green when showing feedback', () => {
    render(
      <QuestionCard
        question={sampleQuestion}
        selectedAnswer={1}
        showFeedback={true}
        onAnswer={() => {}}
      />,
    );
    const correctButton = screen.getByText('Paris');
    expect(correctButton).toHaveClass('question-card__option--correct');
  });

  it('highlights incorrect answer in red when showing feedback', () => {
    render(
      <QuestionCard
        question={sampleQuestion}
        selectedAnswer={0}
        showFeedback={true}
        onAnswer={() => {}}
      />,
    );
    const wrongButton = screen.getByText('London');
    expect(wrongButton).toHaveClass('question-card__option--incorrect');
  });

  it('shows explanation when feedback is displayed', () => {
    render(
      <QuestionCard
        question={sampleQuestion}
        selectedAnswer={1}
        showFeedback={true}
        onAnswer={() => {}}
      />,
    );
    expect(screen.getByText('Paris is the capital of France.')).toBeInTheDocument();
  });

  it('does not show explanation when feedback is not displayed', () => {
    render(
      <QuestionCard
        question={sampleQuestion}
        selectedAnswer={null}
        showFeedback={false}
        onAnswer={() => {}}
      />,
    );
    expect(screen.queryByText('Paris is the capital of France.')).not.toBeInTheDocument();
  });
});
