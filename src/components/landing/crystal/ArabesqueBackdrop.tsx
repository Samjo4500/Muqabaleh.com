'use client';

/**
 * Tasteful Arabian abstract backdrop — landing only.
 * Inspired by mashrabiya, najma stars, ornamental arches, soft vegetal arabesque.
 */
export function ArabesqueBackdrop() {
  return (
    <div className="mq-arabesque pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="mq-orb mq-orb-a" />
      <div className="mq-orb mq-orb-b" />
      <div className="mq-orb mq-orb-c" />
      <div className="mq-arabesque-layer mq-arabesque-layer-a" />
      <div className="mq-arabesque-layer mq-arabesque-layer-b" />
      <div className="mq-arabesque-arch mq-arabesque-arch-l" />
      <div className="mq-arabesque-arch mq-arabesque-arch-r" />
      <div className="mq-arabesque-arch mq-arabesque-arch-mid" />
      <div className="mq-arabesque-vignette" />
    </div>
  );
}

/** Soft corner ornaments fixed to the viewport (must sit outside overflow:hidden). */
export function ArabesqueCorners() {
  return (
    <div className="mq-arabesque-fixed pointer-events-none fixed inset-0 z-[5] overflow-hidden" aria-hidden>
      <div className="mq-arabesque-corner mq-arabesque-corner-tl" />
      <div className="mq-arabesque-corner mq-arabesque-corner-tr" />
      <div className="mq-arabesque-corner mq-arabesque-corner-bl" />
      <div className="mq-arabesque-corner mq-arabesque-corner-br" />
    </div>
  );
}
