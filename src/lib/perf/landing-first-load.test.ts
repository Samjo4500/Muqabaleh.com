import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

function src(rel: string) {
  return readFileSync(new URL(rel, import.meta.url), 'utf8');
}

describe('homepage first-load graph', () => {
  it('keeps path and FAQ as server HTML', () => {
    assert.equal(src('../../components/landing/crystal/SimplePath.tsx').startsWith("'use client'"), false);
    assert.equal(src('../../components/landing/crystal/FAQ.tsx').startsWith("'use client'"), false);
    assert.equal(src('../../components/landing/crystal/Hero.tsx').startsWith("'use client'"), false);
  });

  it('does not preload extra hero variants from the LCP picture', () => {
    const hero = src('../../components/landing/crystal/HeroLcpImage.tsx');
    assert.doesNotMatch(hero, /<link[\s\n]/);
    assert.match(hero, /HERO_LCP_MOBILE/);
  });

  it('defers cinematic islands until intersection', () => {
    const loader = src('../../components/landing/crystal/BelowFoldLoader.tsx');
    assert.match(loader, /IntersectionObserver/);
    assert.doesNotMatch(loader, /setTimeout/);
    assert.match(loader, /import\('\.\/Jeannie'\)/);
  });
});
