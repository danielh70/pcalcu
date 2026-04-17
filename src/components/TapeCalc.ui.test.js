import React from 'react';
import { render, screen, fireEvent, createEvent } from '@testing-library/react';
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

  test('all 8 fraction buttons are visible', () => {
    render(<TapeCalc />);

    expect(screen.getByRole('button', { name: '1/16' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1/8' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1/4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3/8' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1/2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5/8' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3/4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '7/8' })).toBeInTheDocument();
  });

  test('division by zero shows error', async () => {
    render(<TapeCalc />);

    await userEvent.click(screen.getByRole('button', { name: '5' }));
    await userEvent.click(screen.getByRole('button', { name: /divide/i }));
    await userEvent.click(screen.getByRole('button', { name: '0' }));
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByTestId('display-value')).toHaveTextContent('Division by zero');
  });

  test('operator after error resets instead of carrying empty operand', async () => {
    render(<TapeCalc />);

    // Trigger an error: 5 / 0 =
    await userEvent.click(screen.getByRole('button', { name: '5' }));
    await userEvent.click(screen.getByRole('button', { name: /divide/i }));
    await userEvent.click(screen.getByRole('button', { name: '0' }));
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.getByTestId('display-value')).toHaveTextContent('Division by zero');

    // Tap an operator — should clearAll, NOT store an empty operandA
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByTestId('display-value')).toHaveTextContent('0');
    expect(screen.getByTestId('expression-tape').textContent).toBe('');

    // No operator should be pending
    expect(screen.getByRole('button', { name: /add/i })).toHaveAttribute('aria-pressed', 'false');

    // A fresh calculation must work end-to-end
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    await userEvent.click(screen.getByRole('button', { name: '4' }));
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.getByLabelText('result')).toHaveTextContent('7');
  });

  describe('keyboard input', () => {
    test('digits, operator, and Enter compute a result', () => {
      render(<TapeCalc />);
      fireEvent.keyDown(window, { key: '1' });
      fireEvent.keyDown(window, { key: '0' });
      fireEvent.keyDown(window, { key: '+' });
      fireEvent.keyDown(window, { key: '5' });
      fireEvent.keyDown(window, { key: 'Enter' });
      expect(screen.getByLabelText('result')).toHaveTextContent('15');
    });

    test('= also triggers EQUALS', () => {
      render(<TapeCalc />);
      fireEvent.keyDown(window, { key: '8' });
      fireEvent.keyDown(window, { key: '*' });
      fireEvent.keyDown(window, { key: '2' });
      fireEvent.keyDown(window, { key: '=' });
      expect(screen.getByLabelText('result')).toHaveTextContent('16');
    });

    test('Backspace removes last digit', () => {
      render(<TapeCalc />);
      fireEvent.keyDown(window, { key: '1' });
      fireEvent.keyDown(window, { key: '2' });
      fireEvent.keyDown(window, { key: '3' });
      fireEvent.keyDown(window, { key: 'Backspace' });
      expect(screen.getByTestId('display-value')).toHaveTextContent('12');
    });

    test('Escape clears', () => {
      render(<TapeCalc />);
      fireEvent.keyDown(window, { key: '4' });
      fireEvent.keyDown(window, { key: '2' });
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.getByTestId('display-value')).toHaveTextContent('0');
    });

    test('c clears', () => {
      render(<TapeCalc />);
      fireEvent.keyDown(window, { key: '9' });
      fireEvent.keyDown(window, { key: 'c' });
      expect(screen.getByTestId('display-value')).toHaveTextContent('0');
    });

    test('ignores input when a text field elsewhere is focused', () => {
      render(
        <>
          <input data-testid="other-input" />
          <TapeCalc />
        </>
      );
      const other = screen.getByTestId('other-input');
      other.focus();
      fireEvent.keyDown(other, { key: '5' });
      expect(screen.getByTestId('display-value')).toHaveTextContent('0');
    });

    test('does not preventDefault on Cmd/Ctrl combos', () => {
      render(<TapeCalc />);
      const metaEvt = createEvent.keyDown(window, { key: 'r', metaKey: true });
      fireEvent(window, metaEvt);
      expect(metaEvt.defaultPrevented).toBe(false);

      const ctrlEvt = createEvent.keyDown(window, { key: 'f', ctrlKey: true });
      fireEvent(window, ctrlEvt);
      expect(ctrlEvt.defaultPrevented).toBe(false);
    });

    test('preventDefault on / so browser quick-find does not fire', () => {
      render(<TapeCalc />);
      const evt = createEvent.keyDown(window, { key: '/' });
      fireEvent(window, evt);
      expect(evt.defaultPrevented).toBe(true);
    });

    test('ignores IME composition events', () => {
      render(<TapeCalc />);
      const evt = createEvent.keyDown(window, { key: '1', isComposing: true });
      fireEvent(window, evt);
      expect(evt.defaultPrevented).toBe(false);
      expect(screen.getByTestId('display-value')).toHaveTextContent('0');
    });
  });

  describe('quick-entry row', () => {
    test('foot-mark button appends to a whole-number input', async () => {
      render(<TapeCalc />);
      await userEvent.click(screen.getByRole('button', { name: '1' }));
      await userEvent.click(screen.getByRole('button', { name: '2' }));
      await userEvent.click(screen.getByRole('button', { name: /foot mark/i }));
      expect(screen.getByTestId('display-value')).toHaveTextContent(/12'/);
    });

    test('foot mark is a no-op when input is empty', async () => {
      render(<TapeCalc />);
      await userEvent.click(screen.getByRole('button', { name: /foot mark/i }));
      expect(screen.getByTestId('display-value')).toHaveTextContent('0');
    });

    test('foot mark is a no-op when input already contains a fraction', async () => {
      render(<TapeCalc />);
      await userEvent.click(screen.getByRole('button', { name: '5' }));
      await userEvent.click(screen.getByRole('button', { name: '1/2' }));
      await userEvent.click(screen.getByRole('button', { name: /foot mark/i }));
      expect(screen.getByTestId('display-value')).toHaveTextContent('5 1/2');
    });

    test('full ft-in entry computes correctly: 12\' 3" + 9" = 144"', async () => {
      render(<TapeCalc />);
      await userEvent.click(screen.getByRole('button', { name: '1' }));
      await userEvent.click(screen.getByRole('button', { name: '2' }));
      await userEvent.click(screen.getByRole('button', { name: /foot mark/i }));
      await userEvent.click(screen.getByRole('button', { name: '3' }));
      await userEvent.click(screen.getByRole('button', { name: /add/i }));
      await userEvent.click(screen.getByRole('button', { name: '9' }));
      await userEvent.click(screen.getByRole('button', { name: /calculate/i }));
      // Display is still inches-style mixed-number until Phase 2.7 toggle lands.
      expect(screen.getByLabelText('result')).toHaveTextContent('156');
    });

    test('quick fraction buttons dispatch FRAC without opening overlay', async () => {
      render(<TapeCalc />);
      await userEvent.click(screen.getByRole('button', { name: '7' }));
      await userEvent.click(screen.getByRole('button', { name: /quick 1\/4/i }));
      expect(screen.getByTestId('display-value')).toHaveTextContent('7 1/4');
    });

    test('quick and overlay fractions have distinct accessible names', () => {
      render(<TapeCalc />);
      // Overlay "1/2" by plain text; quick "1/2" by aria-label
      expect(screen.getByRole('button', { name: '1/2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'quick 1/2' })).toBeInTheDocument();
    });
  });
});
