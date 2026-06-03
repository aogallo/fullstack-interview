import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders the correct fraction text', () => {
    render(<ProgressBar current={3} total={10} />);
    expect(screen.getByText('Question 3 of 10')).toBeInTheDocument();
  });

  it('renders "Question 1 of 1" for single question', () => {
    render(<ProgressBar current={1} total={1} />);
    expect(screen.getByText('Question 1 of 1')).toBeInTheDocument();
  });

  it('shows 0% width when current is 0', () => {
    const { container } = render(<ProgressBar current={0} total={5} />);
    const fillDiv = container.querySelector('.progress-bar__fill');
    expect(fillDiv).toBeInTheDocument();
    expect(fillDiv).toHaveStyle('width: 0%');
  });

  it('calculates correct fill width percentage', () => {
    const { container } = render(<ProgressBar current={5} total={10} />);
    const fillDiv = container.querySelector('.progress-bar__fill');
    expect(fillDiv).toBeInTheDocument();
    expect(fillDiv).toHaveStyle('width: 50%');
  });

  it('shows 100% when current equals total', () => {
    const { container } = render(<ProgressBar current={10} total={10} />);
    const fillDiv = container.querySelector('.progress-bar__fill');
    expect(fillDiv).toBeInTheDocument();
    expect(fillDiv).toHaveStyle('width: 100%');
  });

  it('shows 0% when total is 0', () => {
    const { container } = render(<ProgressBar current={0} total={0} />);
    const fillDiv = container.querySelector('.progress-bar__fill');
    expect(fillDiv).toBeInTheDocument();
    expect(fillDiv).toHaveStyle('width: 0%');
  });
});
