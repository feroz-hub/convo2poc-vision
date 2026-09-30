import { Link, type RouteObject } from 'react-router-dom';
import { AppShell } from '@/components/shell/AppShell';
import { StagePlaceholder } from '@/pages/StagePlaceholder';
import { routes } from './routes';
export const routeObjects: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      ...routes.map((route) => ({
        path: route.path,
        ...(route.path === '/'
          ? {
              hydrateFallbackElement: (
                <section className="page-content" role="status">
                  Preparing the Overview workspace…
                </section>
              ),
              lazy: async () => ({
                Component: (await import('@/pages/OverviewPage')).OverviewPage,
              }),
            }
          : { element: <StagePlaceholder route={route} /> }),
      })),
      {
        path: '*',
        element: (
          <section className="page-content">
            <h1>Workspace not found</h1>
            <p>This route is not part of the vision prototype.</p>
            <Link to="/">Return to Overview</Link>
          </section>
        ),
      },
    ],
  },
];
