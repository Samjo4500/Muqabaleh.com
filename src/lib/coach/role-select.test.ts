import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  categoriesWithRoles,
  pickInitialRole,
  resolveCategoryId,
  roleMatchesCategory,
  rolesForPicker,
  type CatalogRole,
} from './role-select';
import { inferCoachRoleIdFromTitle } from '../jobs/jeannie-practice';

type ConfigFile = {
  roleCategories: { id: string; en: string; ar: string }[];
  roles: CatalogRole[];
};

const config = JSON.parse(
  readFileSync(join(process.cwd(), 'config', 'interview-config.json'), 'utf8'),
) as ConfigFile;

describe('interview role catalog', () => {
  it('has Technology roles including Software Engineer', () => {
    assert.ok(config.roles.length > 0, 'roles catalog must not be empty');
    const tech = config.roles.filter((r) => r.category === 'tech');
    assert.ok(tech.length >= 3, `expected 3+ tech roles, got ${tech.length}`);
    assert.ok(tech.some((r) => r.id === 'software-engineer' && r.en === 'Software Engineer'));
    assert.ok(tech.some((r) => r.id === 'staff-software-engineer'));
  });

  it('resolves Technology label to tech id', () => {
    assert.equal(resolveCategoryId('Technology', config.roleCategories), 'tech');
    assert.equal(resolveCategoryId('التقنية', config.roleCategories), 'tech');
    assert.equal(resolveCategoryId('tech', config.roleCategories), 'tech');
    assert.ok(roleMatchesCategory('tech', 'Technology', config.roleCategories));
  });
});

describe('rolesForPicker', () => {
  it('shows tech roles for default Technology category', () => {
    const { roles } = rolesForPicker(config.roles, config.roleCategories, 'tech', '');
    assert.ok(roles.some((r) => r.id === 'software-engineer'));
    assert.ok(roles.every((r) => r.category === 'tech'));
  });

  it('does not show 0 roles when search is a leftover job title', () => {
    const { roles, searchMiss } = rolesForPicker(
      config.roles,
      config.roleCategories,
      'tech',
      'business manager',
    );
    assert.equal(searchMiss, true);
    assert.ok(roles.length > 0, 'must fall back to category roles instead of empty');
    assert.ok(roles.some((r) => r.id === 'software-engineer'));
  });

  it('hides empty categories', () => {
    const populated = categoriesWithRoles(
      [...config.roleCategories, { id: 'empty', en: 'Empty', ar: 'فارغ' }],
      config.roles,
    );
    assert.ok(!populated.some((c) => c.id === 'empty'));
    assert.ok(populated.some((c) => c.id === 'tech'));
  });
});

describe('pickInitialRole', () => {
  it('defaults to Technology / Software Engineer with no job title', () => {
    const picked = pickInitialRole(config.roles, config.roleCategories, {});
    assert.equal(picked.categoryId, 'tech');
    assert.equal(picked.role?.id, 'software-engineer');
  });

  it('maps a business-manager job title onto a real role without emptying tech', () => {
    const id = inferCoachRoleIdFromTitle('business manager');
    const picked = pickInitialRole(config.roles, config.roleCategories, { matchedRoleId: id });
    assert.ok(picked.role, 'must pick a catalog role');
    const visible = rolesForPicker(
      config.roles,
      config.roleCategories,
      picked.categoryId,
      'business manager',
    );
    assert.ok(visible.roles.length > 0);
    assert.ok(visible.roles.some((r) => r.id === picked.role?.id));
  });
});
