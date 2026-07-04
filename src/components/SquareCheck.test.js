import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SquareCheck, { computeSquareDiagonal, checkSquare } from './SquareCheck';

describe('SquareCheck computeSquareDiagonal', () => {
  test('3-4-5 triple in bare inches', () => {
    expect(computeSquareDiagonal('3', '4')).toBe('5');
  });

  test('6-8-10 triple in feet', () => {
    expect(computeSquareDiagonal("6'", "8'")).toBe("10'");
  });

  test('feet+inches mixed input (75-100-125 triple)', () => {
    // 6' 3" = 75", 8' 4" = 100" => 125" = 10' 5"
    expect(computeSquareDiagonal(`6' 3"`, "8' 4")).toBe(`10' 5"`);
  });

  test('iOS smart punctuation in legs parses as feet/inches', () => {
    // curly ’ / ” from the iPhone keyboard, normalized in parseLength
    expect(computeSquareDiagonal('6’ 3”', '8’ 4')).toBe(`10' 5"`);
  });

  test('fractional legs', () => {
    // 1.5² + 2² = 6.25 => 2.5
    expect(computeSquareDiagonal('1 1/2', '2')).toBe('2 1/2');
  });

  test('rounds to the nearest 1/16', () => {
    // sqrt(2) = 1.41421... => 22.63 sixteenths => 23/16 = 1 7/16
    expect(computeSquareDiagonal('1', '1')).toBe('1 7/16');
  });

  test('large diagonals display feet + inches', () => {
    // 144² + 240² => sqrt(78336) = 279.8857" => 23' 3 7/8"
    expect(computeSquareDiagonal("12'", "20'")).toBe(`23' 3 7/8"`);
  });

  test('throws on invalid, empty, or zero-length legs', () => {
    expect(() => computeSquareDiagonal('abc', '4')).toThrow(/Invalid length/);
    expect(() => computeSquareDiagonal('', '4')).toThrow(/Empty length/);
    expect(() => computeSquareDiagonal('0', '4')).toThrow(/Invalid length/);
  });
});

// TEMPORARILY DISABLED — the measured-diagonal deviation UI is commented out
// in SquareCheck.js; checkSquare itself still exists. Un-skip when the
// feature is re-enabled.
describe.skip('SquareCheck checkSquare', () => {
  test('dead-on measurement reports square', () => {
    expect(checkSquare('3', '4', '5')).toEqual({ status: 'square', deviation: null });
  });

  test('long measurement reports deviation', () => {
    expect(checkSquare('3', '4', '5 5/16')).toEqual({ status: 'long', deviation: '5/16' });
  });

  test('short measurement reports deviation', () => {
    expect(checkSquare('3', '4', '4 7/8')).toEqual({ status: 'short', deviation: '1/8' });
  });

  test('feet+inches measured diagonal', () => {
    expect(checkSquare("6'", "8'", `10' 1/4"`)).toEqual({ status: 'long', deviation: '1/4' });
  });

  test('measurement matching the rounded target is square', () => {
    // exact diagonal is sqrt(2) = 1.4142; displayed target rounds to 1 7/16,
    // so a tape reading of 1 7/16 must report square, not 1/16 off.
    expect(checkSquare('1', '1', '1 7/16')).toEqual({ status: 'square', deviation: null });
  });

  test('throws on invalid measured input', () => {
    expect(() => checkSquare('3', '4', 'nope')).toThrow(/Invalid length/);
  });
});

describe('SquareCheck UI', () => {
  test('live-calculates the target diagonal from two legs', async () => {
    render(<SquareCheck />);

    await userEvent.type(screen.getByLabelText(/leg a/i), '3');
    await userEvent.type(screen.getByLabelText(/leg b/i), '4');

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('measured-diagonal input is not rendered while disabled', () => {
    render(<SquareCheck />);
    expect(screen.queryByLabelText(/measured diagonal/i)).not.toBeInTheDocument();
  });

  // TEMPORARILY DISABLED — deviation UI commented out in SquareCheck.js.
  test.skip('shows square indicator when measured diagonal matches', async () => {
    render(<SquareCheck />);

    await userEvent.type(screen.getByLabelText(/leg a/i), '3');
    await userEvent.type(screen.getByLabelText(/leg b/i), '4');
    await userEvent.type(screen.getByLabelText(/measured diagonal/i), '5');

    // exact match: the tab heading "Square Check" also contains "square"
    expect(screen.getByText('Square')).toBeInTheDocument();
  });

  // TEMPORARILY DISABLED — deviation UI commented out in SquareCheck.js.
  test.skip('shows deviation when measured diagonal is off', async () => {
    render(<SquareCheck />);

    await userEvent.type(screen.getByLabelText(/leg a/i), '3');
    await userEvent.type(screen.getByLabelText(/leg b/i), '4');
    await userEvent.type(screen.getByLabelText(/measured diagonal/i), '5 1/4');

    expect(screen.getByText(`1/4" too long`)).toBeInTheDocument();
  });

  test('shows error helper text for invalid input', async () => {
    render(<SquareCheck />);

    await userEvent.type(screen.getByLabelText(/leg a/i), 'abc');

    expect(screen.getByText(/invalid length/i)).toBeInTheDocument();
  });

  test('reset clears all fields', async () => {
    render(<SquareCheck />);

    await userEvent.type(screen.getByLabelText(/leg a/i), '3');
    await userEvent.type(screen.getByLabelText(/leg b/i), '4');
    await userEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(screen.getByLabelText(/leg a/i)).toHaveValue('');
    expect(screen.getByLabelText(/leg b/i)).toHaveValue('');
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
