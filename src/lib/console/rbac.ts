import type { OrgMemberRole } from './types';

export type ConsolePermission =
  | 'billing'
  | 'delete_org'
  | 'manage_team'
  | 'manage_settings'
  | 'manage_jobs'
  | 'move_pipeline'
  | 'add_notes'
  | 'view_passports'
  | 'conduct_interview'
  | 'view_analytics'
  | 'export';

const MATRIX: Record<OrgMemberRole, ConsolePermission[]> = {
  OWNER: [
    'billing',
    'delete_org',
    'manage_team',
    'manage_settings',
    'manage_jobs',
    'move_pipeline',
    'add_notes',
    'view_passports',
    'conduct_interview',
    'view_analytics',
    'export',
  ],
  ADMIN: [
    'manage_team',
    'manage_settings',
    'manage_jobs',
    'move_pipeline',
    'add_notes',
    'view_passports',
    'conduct_interview',
    'view_analytics',
    'export',
  ],
  HIRING_MANAGER: [
    'manage_jobs',
    'move_pipeline',
    'add_notes',
    'view_passports',
    'view_analytics',
    'export',
  ],
  REVIEWER: ['view_passports'],
  INTERVIEWER: ['view_passports', 'conduct_interview', 'add_notes'],
};

export function can(role: OrgMemberRole, permission: ConsolePermission): boolean {
  return MATRIX[role]?.includes(permission) ?? false;
}

export function seatCapForOrgPlan(plan: string): number {
  const p = plan.toUpperCase();
  if (p.includes('ENTERPRISE')) return 50;
  if (p.includes('PRO')) return 15;
  return 5;
}
