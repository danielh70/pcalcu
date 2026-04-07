import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders top navigation and tabs', () => {
  render(<App />);
  expect(screen.getByText('Field Calc')).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: /post level/i })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: /tape calc/i })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: /systems/i })).toBeInTheDocument();
});

test('can switch tabs and see each tool', async () => {
  render(<App />);

  // Post Level is default; confirm its primary control exists.
  expect(screen.getByText(/target post height/i)).toBeInTheDocument();

  await userEvent.click(screen.getByRole('tab', { name: /tape calc/i }));
  expect(screen.getByLabelText(/length 1/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/length 2/i)).toBeInTheDocument();

  await userEvent.click(screen.getByRole('tab', { name: /systems/i }));
  expect(screen.getByText(/gap:/i)).toBeInTheDocument();
});
