import { render, screen } from '@testing-library/react';
import App from '@/App';

describe('App', () => {
  it('renders sidebar with all nav items', () => {
    render(<App />);
    expect(screen.getAllByText('Command Center').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Bookmarks')).toBeInTheDocument();
    expect(screen.getByText('Pomodoro')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('shows dashboard welcome message by default', () => {
    render(<App />);
    expect(screen.getByText('Welcome back. Here\'s your overview.')).toBeInTheDocument();
  });
});
