import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TapeCalc from './TapeCalc';

describe('TapeCalc UI', () => {
  test('shows only nearest 1/16 result after compute', async () => {
    render(<TapeCalc />);

    // Enter 10 in Length 1 via keypad
    await userEvent.click(screen.getByRole('button', { name: '1' }));
    await userEvent.click(screen.getByRole('button', { name: '0' }));

    // Click divide (default) to switch active field to Length 2
    await userEvent.click(screen.getByRole('button', { name: /divide/i }));

    // Enter 1/2 in Length 2 via fraction button
    await userEvent.click(screen.getByRole('button', { name: '1/2' }));

    // Calculate
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    // 10 ÷ 1/2 = 20
    const result = await screen.findByLabelText('result');
    expect(result).toHaveTextContent(/20/);
    expect(result).not.toHaveTextContent(/nearest 1\/16/);
  });

  test('reset button clears inputs and result', async () => {
    render(<TapeCalc />);

    // Enter values and compute
    await userEvent.click(screen.getByRole('button', { name: '1' }));
    await userEvent.click(screen.getByRole('button', { name: '0' }));
    await userEvent.click(screen.getByRole('button', { name: /divide/i }));
    await userEvent.click(screen.getByRole('button', { name: '1/2' }));
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    const result = screen.getByLabelText('result');
    expect(result).toHaveTextContent(/20/);

    // Reset
    await userEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByTestId('length1-value')).toHaveTextContent('0');
    expect(screen.getByTestId('length2-value')).toHaveTextContent('0');
    expect(result).toHaveTextContent(/\u2014/);
  });

  test('operator buttons perform the correct operation', async () => {
    render(<TapeCalc />);

    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subtract/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /multiply/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /divide/i })).toBeInTheDocument();

    // Enter 10 in Length 1
    await userEvent.click(screen.getByRole('button', { name: '1' }));
    await userEvent.click(screen.getByRole('button', { name: '0' }));

    // Click multiply (switches to Length 2)
    await userEvent.click(screen.getByRole('button', { name: /multiply/i }));

    // Enter 1/2 in Length 2
    await userEvent.click(screen.getByRole('button', { name: '1/2' }));

    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    const result = screen.getByLabelText('result');
    expect(result).toHaveTextContent(/5/);

    // Switch to subtract and recalculate
    await userEvent.click(screen.getByRole('button', { name: /subtract/i }));
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));
    expect(result).toHaveTextContent(/9 1\/2|9.5|19\/2/);
  });

  test('selection indicator toggles on operator click', async () => {
    render(<TapeCalc />);

    const addBtn = screen.getByRole('button', { name: /add/i });
    const mulBtn = screen.getByRole('button', { name: /multiply/i });
    const subBtn = screen.getByRole('button', { name: /subtract/i });

    await userEvent.click(addBtn);
    expect(addBtn).toHaveClass('Mui-selected');
    expect(mulBtn).not.toHaveClass('Mui-selected');

    await userEvent.click(mulBtn);
    expect(mulBtn).toHaveClass('Mui-selected');
    expect(addBtn).not.toHaveClass('Mui-selected');

    await userEvent.click(subBtn);
    expect(subBtn).toHaveClass('Mui-selected');
    expect(mulBtn).not.toHaveClass('Mui-selected');
  });

  test('selected operator shows non-transparent background', async () => {
    render(<TapeCalc />);
    const divideBtn = screen.getByRole('button', { name: /divide/i });

    await userEvent.click(divideBtn);
    const styles = window.getComputedStyle(divideBtn);
    expect(styles.backgroundColor).not.toBe('transparent');
    expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('fraction appends to whole number in active field', async () => {
    render(<TapeCalc />);

    await userEvent.click(screen.getByRole('button', { name: '1' }));
    await userEvent.click(screen.getByRole('button', { name: '4' }));
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    await userEvent.click(screen.getByRole('button', { name: '7/8' }));

    expect(screen.getByTestId('length1-value')).toHaveTextContent('143 7/8');
  });

  test('fraction replaces existing fraction', async () => {
    render(<TapeCalc />);

    await userEvent.click(screen.getByRole('button', { name: '5' }));
    await userEvent.click(screen.getByRole('button', { name: '1/2' }));
    expect(screen.getByTestId('length1-value')).toHaveTextContent('5 1/2');

    await userEvent.click(screen.getByRole('button', { name: '3/4' }));
    expect(screen.getByTestId('length1-value')).toHaveTextContent('5 3/4');
  });

  test('backspace removes entire fraction at once', async () => {
    render(<TapeCalc />);

    await userEvent.click(screen.getByRole('button', { name: '5' }));
    await userEvent.click(screen.getByRole('button', { name: '1/2' }));
    expect(screen.getByTestId('length1-value')).toHaveTextContent('5 1/2');

    await userEvent.click(screen.getByRole('button', { name: /backspace/i }));
    expect(screen.getByTestId('length1-value')).toHaveTextContent('5');
  });

  test('tapping operation auto-switches active field to Length 2', async () => {
    render(<TapeCalc />);

    await userEvent.click(screen.getByRole('button', { name: '8' }));
    expect(screen.getByTestId('length1-value')).toHaveTextContent('8');

    // Click add (switches to Length 2)
    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    // Digits now go to Length 2
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(screen.getByTestId('length2-value')).toHaveTextContent('3');
    expect(screen.getByTestId('length1-value')).toHaveTextContent('8');
  });

  test('clear entry button clears only the active field', async () => {
    render(<TapeCalc />);

    // Enter 5 in Length 1
    await userEvent.click(screen.getByRole('button', { name: '5' }));
    expect(screen.getByTestId('length1-value')).toHaveTextContent('5');

    // Switch to Length 2 and enter 3
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(screen.getByTestId('length2-value')).toHaveTextContent('3');

    // Clear entry clears Length 2 only
    await userEvent.click(screen.getByRole('button', { name: /clear entry/i }));
    expect(screen.getByTestId('length2-value')).toHaveTextContent('0');
    expect(screen.getByTestId('length1-value')).toHaveTextContent('5');
  });

  test('tapping display area switches active field', async () => {
    render(<TapeCalc />);

    // Enter 5 in Length 1 (default active)
    await userEvent.click(screen.getByRole('button', { name: '5' }));

    // Tap Length 2 display to switch
    await userEvent.click(screen.getByLabelText(/length 2/i));

    // Digits now go to Length 2
    await userEvent.click(screen.getByRole('button', { name: '9' }));
    expect(screen.getByTestId('length2-value')).toHaveTextContent('9');
    expect(screen.getByTestId('length1-value')).toHaveTextContent('5');
  });
});
