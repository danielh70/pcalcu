import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Systems, { computeSpindleGap } from './Systems';

describe('Systems computeSpindleGap', () => {
  test('computes expected gap for a multiple of 4 3/8', () => {
    // length = 8 3/4 => mod 4 3/8 = 0
    // (0 + 3 19/32) / 2 = 1.796875 => nearest 1/16 = 1 13/16
    expect(computeSpindleGap('8 3/4')).toBe('1 13/16');
  });

  test('uses alternate branch when landing on a spindle', () => {
    // length = 7 7/8 => mod 4 3/8 = 3.5
    // (3.5 + 3 19/32)/2 = 3.546875 (>3.2) so use (3.5 - 25/32)/2 = 1.359375 => nearest 1/16 = 1 3/8
    expect(computeSpindleGap('7 7/8')).toBe('1 3/8');
  });

  test('throws on invalid length', () => {
    expect(() => computeSpindleGap('nope')).toThrow(/Invalid length|Empty length/);
  });
});

describe('Systems UI', () => {
  test('calculates and renders gap', async () => {
    render(<Systems />);

    await userEvent.type(screen.getByLabelText(/length/i), '8 3/4');
    await userEvent.click(screen.getByRole('button', { name: /go/i }));

    expect(screen.getByText('1 13/16')).toBeInTheDocument();
  });

  test('disables Go and shows error for invalid input', async () => {
    render(<Systems />);

    await userEvent.type(screen.getByLabelText(/length/i), 'abc');

    expect(screen.getByRole('button', { name: /go/i })).toBeDisabled();
    expect(screen.getByText(/invalid length/i)).toBeInTheDocument();
  });
});
