import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers';
import { routeObjects } from '@/app/routeObjects';
import { useDemoStore } from '@/store/demoStore';
const renderTheme = () =>
  render(
    <AppProviders>
      <RouterProvider
        router={createMemoryRouter(routeObjects, {
          initialEntries: ['/session'],
        })}
      />
    </AppProviders>,
  );
describe('internal presentation themes', () => {
  beforeEach(() => {
    document.documentElement.classList.add('dark');
    localStorage.clear();
    useDemoStore.getState().reset();
  });
  it('identifies the brand area and concept status without a production claim', () => {
    renderTheme();
    expect(screen.getByLabelText('HCLTech brand area')).toBeInTheDocument();
    expect(screen.getByText('Internal Concept Prototype')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Internal exploration · Not an approved production product',
      ),
    ).toBeInTheDocument();
  });
  it('switches both ways and persists the chosen theme', async () => {
    const user = userEvent.setup();
    renderTheme();
    await user.click(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    );
    expect(document.documentElement).not.toHaveClass('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem('convo2poc-theme')).toBe('light');
    await user.click(
      screen.getByRole('button', { name: 'Switch to dark mode' }),
    );
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('convo2poc-theme')).toBe('dark');
  });
  it('preserves theme through manual navigation and demo reset', async () => {
    const user = userEvent.setup();
    renderTheme();
    await user.click(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    );
    await user.click(screen.getByRole('link', { name: 'POC Scope' }));
    await user.click(screen.getByRole('button', { name: 'Reset scenario' }));
    expect(
      screen.getByRole('heading', { name: 'POC Scope' }),
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });
});
