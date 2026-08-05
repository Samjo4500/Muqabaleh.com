'use client';

/**
 * Tasteful Arabian geometric backdrop — landing only.
 * Soft khatam/mashrabiya lattice in gold + teal, low contrast.
 */
export function ArabesqueBackdrop() {
  return (
    <div className="mq-arabesque pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* soft brand orbs stay under pattern */}
      <div className="mq-orb mq-orb-a" />
      <div className="mq-orb mq-orb-b" />
      <div className="mq-orb mq-orb-c" />

      {/* large geometric wash */}
      <div className="mq-arabesque-layer mq-arabesque-layer-a" />
      {/* finer mesh */}
      <div className="mq-arabesque-layer mq-arabesque-layer-b" />

      {/* corner flourishes — stronger at edges, fade toward content */}
      <div className="mq-arabesque-corner mq-arabesque-corner-tl" />
      <div className="mq-arabesque-corner mq-arabesque-corner-tr" />
      <div className="mq-arabesque-corner mq-arabesque-corner-bl" />
      <div className="mq-arabesque-corner mq-arabesque-corner-br" />

      {/* vignette so pattern never fights content */}
      <div className="mq-arabesque-vignette" />
    </div>
  );
}
