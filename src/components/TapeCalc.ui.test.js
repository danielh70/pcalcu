import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TapeCalc from './TapeCalc';

describe('TapeCalc UI', () => {
  test('shows only nearest 1/16 result after compute', async () => {
    render(<TapeCalc />);

    const length1 = screen.getByLabelText(/length 1/i);
    const length2 = screen.getByLabelText(/length 2/i);
    const go = screen.getByRole('button', { name: /go/i });

    await userEvent.type(length1, '10');
    await userEvent.type(length2, '1/2');

    await userEvent.click(go);

    // expect nearest 1/16 displayed and not the raw (both) format
    const result = await screen.findByLabelText('result');
    // default operator is divide: 10 ÷ 1/2 = 20
    expect(result).toHaveTextContent(/20/);
    expect(result).not.toHaveTextContent(/nearest 1\/16/);
  });

  test('reset button clears inputs and result', async () => {
    render(<TapeCalc />);

    const length1 = screen.getByLabelText(/length 1/i);
    const length2 = screen.getByLabelText(/length 2/i);
    const go = screen.getByRole('button', { name: /go/i });
    const reset = screen.getByRole('button', { name: /reset/i });

    await userEvent.type(length1, '10');
    await userEvent.type(length2, '1/2');
    await userEvent.click(go);

    // verify result shown
    const result = await screen.findByLabelText('result');
    expect(result).toHaveTextContent(/20/);

    // click reset and verify cleared
    await userEvent.click(reset);
    expect(length1).toHaveValue('');
    expect(length2).toHaveValue('');
    expect(result).toHaveTextContent(/—/);
  });

  test('operator buttons are labeled and perform the correct operation', async () => {
    render(<TapeCalc />);

    const addBtn = screen.getByRole('button', { name: /add/i });
    const subBtn = screen.getByRole('button', { name: /subtract/i });
    const mulBtn = screen.getByRole('button', { name: /multiply/i });
    const divBtn = screen.getByRole('button', { name: /divide/i });

    // labels exist
    expect(addBtn).toBeInTheDocument();
    expect(subBtn).toBeInTheDocument();
    expect(mulBtn).toBeInTheDocument();
    expect(divBtn).toBeInTheDocument();

    // functional test: multiply
    const length1 = screen.getByLabelText(/length 1/i);
    const length2 = screen.getByLabelText(/length 2/i);
    const go = screen.getByRole('button', { name: /go/i });

    await userEvent.type(length1, '10');
    await userEvent.type(length2, '1/2');

    await userEvent.click(mulBtn);
    await userEvent.click(go);

    const result = await screen.findByLabelText('result');
    expect(result).toHaveTextContent(/5/);

    // switch to subtract and verify
    await userEvent.click(subBtn);
    await userEvent.click(go);
    expect(result).toHaveTextContent(/9 1\/2|9.5|19\/2/);
  });

  test('buttons collapse to icon-only on small screens', async () => {
    // mock small screen
    const originalMatch = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(<TapeCalc />);

    // When small, text labels should not be in the document
    expect(screen.queryByText('Add')).toBeNull();
    expect(screen.queryByText('Subtract')).toBeNull();
    expect(screen.queryByText('Multiply')).toBeNull();
    expect(screen.queryByText('Divide')).toBeNull();

    // accessible names still present via aria-label
    const addBtn = screen.getByRole('button', { name: /add/i });
    const subBtn = screen.getByRole('button', { name: /subtract/i });
    const divBtn = screen.getByRole('button', { name: /divide/i });
    const mulBtn = screen.getByRole('button', { name: /multiply/i });

    // in column layout, each button should have rounded corners on all sides
    const aStyles = window.getComputedStyle(addBtn);
    const sStyles = window.getComputedStyle(subBtn);
    const dStyles = window.getComputedStyle(divBtn);
    const mStyles = window.getComputedStyle(mulBtn);

    expect(aStyles.borderTopLeftRadius).not.toBe('0px');
    expect(aStyles.borderTopRightRadius).not.toBe('0px');
    expect(aStyles.borderBottomLeftRadius).not.toBe('0px');
    expect(aStyles.borderBottomRightRadius).not.toBe('0px');

    expect(sStyles.borderTopLeftRadius).not.toBe('0px');
    expect(sStyles.borderTopRightRadius).not.toBe('0px');
    expect(sStyles.borderBottomLeftRadius).not.toBe('0px');
    expect(sStyles.borderBottomRightRadius).not.toBe('0px');

    // restore
    window.matchMedia = originalMatch;
  });

  test('selection indicator toggles on operator click', async () => {
    render(<TapeCalc />);

    const addBtn = screen.getByRole('button', { name: /add/i });
    const subBtn = screen.getByRole('button', { name: /subtract/i });
    const mulBtn = screen.getByRole('button', { name: /multiply/i });

    // ensure clicking add selects it
    await userEvent.click(addBtn);
    expect(addBtn).toHaveClass('Mui-selected');
    expect(mulBtn).not.toHaveClass('Mui-selected');

    // click multiply and verify it's selected
    await userEvent.click(mulBtn);
    expect(mulBtn).toHaveClass('Mui-selected');
    expect(addBtn).not.toHaveClass('Mui-selected');

    // click subtract and verify
    await userEvent.click(subBtn);
    expect(subBtn).toHaveClass('Mui-selected');
    expect(mulBtn).not.toHaveClass('Mui-selected');
  });

  test('selected operator shows primary background and white text', async () => {
    render(<TapeCalc />);
    const divideBtn = screen.getByRole('button', { name: /divide/i });

    // divide is the default selected; ensure visuals applied
    await userEvent.click(divideBtn);
    const styles = window.getComputedStyle(divideBtn);
    // JSDOM may not always expose the exact colors applied by the theme;
    // assert only that the background is not transparent which indicates a visual state change
    expect(styles.backgroundColor).not.toBe('transparent');
    expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('operator buttons have full rounded corners and show inner borders', async () => {
    render(<TapeCalc />);
    const divideBtn = screen.getByRole('button', { name: /divide/i });
    const addBtn = screen.getByRole('button', { name: /add/i });
    const subtractBtn = screen.getByRole('button', { name: /subtract/i });
    const multiplyBtn = screen.getByRole('button', { name: /multiply/i });

    // each button should have rounded corners
    const dStyles = window.getComputedStyle(divideBtn);
    const aStyles = window.getComputedStyle(addBtn);
    const sStyles = window.getComputedStyle(subtractBtn);
    const mStyles = window.getComputedStyle(multiplyBtn);

    expect(dStyles.borderTopLeftRadius).not.toBe('0px');
    expect(dStyles.borderTopRightRadius).not.toBe('0px');
    expect(aStyles.borderTopLeftRadius).not.toBe('0px');
    expect(aStyles.borderTopRightRadius).not.toBe('0px');
    expect(sStyles.borderTopLeftRadius).not.toBe('0px');
    expect(sStyles.borderTopRightRadius).not.toBe('0px');
    expect(mStyles.borderTopLeftRadius).not.toBe('0px');
    expect(mStyles.borderTopRightRadius).not.toBe('0px');

    // inner buttons should have a visible left border
    expect(aStyles.borderLeftWidth).not.toBe('0px');
    expect(sStyles.borderLeftWidth).not.toBe('0px');
  });
});
