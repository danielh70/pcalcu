import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TapeCalc from './TapeCalc';

describe('TapeCalc UI', () => {
  test('basic calculation: 10 ÷ 1/2 = 20', async () => {
    render(<TapeCalc />);

    await userEvent.click(screen.getByRole('button', { name: '1' }));
    await userEvent.click(screen.getByRole('button', { name: '0' }));
    await userEvent.click(screen.getByRole('button', { name: /divide/i }));
    await userEvent.click(screen.getByRole('button', { name: '1/2' }));
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    const result = screen.getByLabelText('result');
    expect(result).toHaveTextContent('20');
  });

  test('result chaining: 155 - 5 = 150, then ÷ 3 = 50', async () => {
    render(<TapeCalc />);

    // 155 - 5
    await userEvent.click(screen.getByRole('button', { name: '1' }));
    await userEvent.click(screen.getByRole('button', { name: '5' }));
    await userEvent.click(screen.getByRole('button', { name: '5' }));
    await userEvent.click(screen.getByRole('button', { name: /subtract/i }));
    await userEvent.click(screen.getByRole('button', { name: '5' }));
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByLabelText('result')).toHaveTextContent('150');

    // chain: ÷ 3
    await userEvent.click(screen.getByRole('button', { name: /divide/i }));
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByLabelText('result')).toHaveTextContent('50');
  });

  test('typing digit after result starts fresh calculation', async () => {
    render(<TapeCalc />);

    // 8 + 2 = 10
    await userEvent.click(screen.getByRole('button', { name: '8' }));
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByLabelText('result')).toHaveTextContent('10');

    // type "7" — should clear and start fresh
    await userEvent.click(screen.getByRole('button', { name: '7' }));
    expect(screen.getByTestId('display-value')).toHaveTextContent('7');
    // expression tape should be empty (non-breaking space)
    expect(screen.getByTestId('expression-tape').textContent).toBe('');
  });

  test('clear button resets everything', async () => {
    render(<TapeCalc />);

    await userEvent.click(screen.getByRole('button', { name: '5' }));
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByLabelText('result')).toHaveTextContent('8');

    await userEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(screen.getByTestId('display-value')).toHaveTextContent('0');
    expect(screen.getByTestId('expression-tape').textContent).toBe('');
  });

  test('expression tape shows running expression', async () => {
    render(<TapeCalc />);

    // in length1 phase, tape is empty
    expect(screen.getByTestId('expression-tape').textContent).toBe('');

    await userEvent.click(screen.getByRole('button', { name: '1' }));
    await userEvent.click(screen.getByRole('button', { name: '0' }));

    // tap operator → tape shows "10 +"
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByTestId('expression-tape')).toHaveTextContent('10 +');

    // enter length2 and calculate → tape shows full expression
    await userEvent.click(screen.getByRole('button', { name: '5' }));
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.getByTestId('expression-tape')).toHaveTextContent('10 + 5 =');
  });

  test('all four operator buttons exist and work', async () => {
    render(<TapeCalc />);

    expect(screen.getByRole('button', { name: /divide/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subtract/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /multiply/i })).toBeInTheDocument();

    // 10 × 1/2 = 5
    await userEvent.click(screen.getByRole('button', { name: '1' }));
    await userEvent.click(screen.getByRole('button', { name: '0' }));
    await userEvent.click(screen.getByRole('button', { name: /multiply/i }));
    await userEvent.click(screen.getByRole('button', { name: '1/2' }));
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByLabelText('result')).toHaveTextContent('5');
  });

  test('selected operator has aria-pressed', async () => {
    render(<TapeCalc />);

    await userEvent.click(screen.getByRole('button', { name: '5' }));

    const addBtn = screen.getByRole('button', { name: /add/i });
    const mulBtn = screen.getByRole('button', { name: /multiply/i });

    await userEvent.click(addBtn);
    expect(addBtn).toHaveAttribute('aria-pressed', 'true');
    expect(mulBtn).toHaveAttribute('aria-pressed', 'false');

    // switch to multiply
    await userEvent.click(mulBtn);
    expect(mulBtn).toHaveAttribute('aria-pressed', 'true');
    expect(addBtn).toHaveAttribute('aria-pressed', 'false');
  });

  test('fraction appends to whole number', async () => {
    render(<TapeCalc />);

    await userEvent.click(screen.getByRole('button', { name: '1' }));
    await userEvent.click(screen.getByRole('button', { name: '4' }));
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    await userEvent.click(screen.getByRole('button', { name: '7/8' }));

    expect(screen.getByTestId('display-value')).toHaveTextContent('143 7/8');
  });

  test('fraction replaces existing fraction', async () => {
    render(<TapeCalc />);

    await userEvent.click(screen.getByRole('button', { name: '5' }));
    await userEvent.click(screen.getByRole('button', { name: '1/2' }));
    expect(screen.getByTestId('display-value')).toHaveTextContent('5 1/2');

    await userEvent.click(screen.getByRole('button', { name: '3/4' }));
    expect(screen.getByTestId('display-value')).toHaveTextContent('5 3/4');
  });

  test('backspace removes entire fraction at once', async () => {
    render(<TapeCalc />);

    await userEvent.click(screen.getByRole('button', { name: '5' }));
    await userEvent.click(screen.getByRole('button', { name: '1/2' }));
    expect(screen.getByTestId('display-value')).toHaveTextContent('5 1/2');

    await userEvent.click(screen.getByRole('button', { name: /backspace/i }));
    expect(screen.getByTestId('display-value')).toHaveTextContent('5');
  });

  test('backspace removes single digits', async () => {
    render(<TapeCalc />);

    await userEvent.click(screen.getByRole('button', { name: '1' }));
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(screen.getByTestId('display-value')).toHaveTextContent('123');

    await userEvent.click(screen.getByRole('button', { name: /backspace/i }));
    expect(screen.getByTestId('display-value')).toHaveTextContent('12');
  });

  test('sixteenths panel toggles on more button', async () => {
    render(<TapeCalc />);

    // 1/16 should not be visible initially
    expect(screen.queryByRole('button', { name: '1/16' })).not.toBeInTheDocument();

    // tap more
    await userEvent.click(screen.getByRole('button', { name: /more fractions/i }));
    expect(screen.getByRole('button', { name: '1/16' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '15/16' })).toBeInTheDocument();

    // tap fewer
    await userEvent.click(screen.getByRole('button', { name: /fewer fractions/i }));
    expect(screen.queryByRole('button', { name: '1/16' })).not.toBeInTheDocument();
  });

  test('division by zero shows error', async () => {
    render(<TapeCalc />);

    await userEvent.click(screen.getByRole('button', { name: '5' }));
    await userEvent.click(screen.getByRole('button', { name: /divide/i }));
    await userEvent.click(screen.getByRole('button', { name: '0' }));
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByTestId('display-value')).toHaveTextContent('Division by zero');
  });
});
