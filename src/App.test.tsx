import { render, screen } from '@testing-library/react';
import App from './App';

test('renders DevToolBox UI', () => {
  render(<App />);
  const titleElement = screen.getByText(/DevToolBox UI/i);
  expect(titleElement).toBeInTheDocument();
});
