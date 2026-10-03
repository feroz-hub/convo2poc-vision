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
          : route.path === '/session'
            ? {
                hydrateFallbackElement: (
                  <section className="page-content" role="status">
                    Preparing the Live Session workspace…
                  </section>
                ),
                lazy: async () => ({
                  Component: (await import('@/pages/LiveSessionPage'))
                    .LiveSessionPage,
                }),
              }
            : route.path === '/clarifications'
              ? {
                  hydrateFallbackElement: (
                    <section className="page-content" role="status">
                      Preparing the Clarification Center…
                    </section>
                  ),
                  lazy: async () => ({
                    Component: (await import('@/pages/ClarificationsPage'))
                      .ClarificationsPage,
                  }),
                }
              : route.path === '/scope'
                ? {
                    hydrateFallbackElement: (
                      <section className="page-content" role="status">
                        Preparing the POC Scope Studio…
                      </section>
                    ),
                    lazy: async () => ({
                      Component: (await import('@/pages/ScopePage')).ScopePage,
                    }),
                  }
                : route.path === '/requirements'
                  ? {
                      hydrateFallbackElement: (
                        <section className="page-content" role="status">
                          Preparing Requirement Intelligence…
                        </section>
                      ),
                      lazy: async () => ({
                        Component: (await import('@/pages/RequirementsPage'))
                          .RequirementsPage,
                      }),
                    }
                  : route.path === '/generation'
                    ? {
                        hydrateFallbackElement: (
                          <section className="page-content" role="status">
                            Preparing AI Generation Command Center…
                          </section>
                        ),
                        lazy: async () => ({
                          Component: (await import('@/pages/GenerationPage'))
                            .GenerationPage,
                        }),
                      }
                    : route.path === '/preview'
                      ? {
                          hydrateFallbackElement: (
                            <section className="page-content" role="status">
                              Preparing Generated POC Review…
                            </section>
                          ),
                          lazy: async () => ({
                            Component: (await import('@/pages/PreviewPage'))
                              .PreviewPage,
                          }),
                        }
                      : route.path === '/traceability'
                        ? {
                            hydrateFallbackElement: (
                              <section className="page-content" role="status">
                                Preparing Traceability Explorer…
                              </section>
                            ),
                            lazy: async () => ({
                              Component: (
                                await import('@/pages/TraceabilityPage')
                              ).TraceabilityPage,
                            }),
                          }
                        : route.path === '/feedback'
                          ? {
                              hydrateFallbackElement: (
                                <section className="page-content" role="status">
                                  Preparing Client Feedback…
                                </section>
                              ),
                              lazy: async () => ({
                                Component: (
                                  await import('@/pages/FeedbackPage')
                                ).FeedbackPage,
                              }),
                            }
                          : route.path === '/value'
                            ? {
                                hydrateFallbackElement: (
                                  <section
                                    className="page-content"
                                    role="status"
                                  >
                                    Preparing Value Creation Report…
                                  </section>
                                ),
                                lazy: async () => ({
                                  Component: (
                                    await import('@/pages/ValueReportPage')
                                  ).ValueReportPage,
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
