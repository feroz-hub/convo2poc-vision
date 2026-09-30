import type { Scenario } from '@/types/domain';
export const scenario: Scenario = {
  id: 'service-request-modernization',
  name: 'Service Request Management Modernization',
  client: 'Acme Enterprise Services',
  engagement: 'Acme Service Operations Transformation',
  businessProblem:
    'Employees raise internal service requests through email and spreadsheets. Requests are manually triaged, assigned, and tracked.',
  objective:
    'A lightweight digital workflow for creating, assigning, approving, and tracking service requests.',
  actors: ['Employee', 'Support Engineer', 'Administrator', 'Manager'],
};
