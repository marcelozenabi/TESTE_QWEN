export const C = {
  blue: '#213748',
  blueDeep: '#16252f',
  blueDark: '#0e1a22',
  gold: '#D4A45F',
  goldBright: '#F0C98A',
  beige: '#E5D3B6',
  graphite: '#22272B',
  ink: '#101619',
};

export type Vec = [number, number];

export const lerp2 = (a: Vec, b: Vec, t: number): Vec => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];

export function splinePath(pts: Vec[], stepsPerSeg = 10): string {
  if (pts.length < 2) return '';
  const out: Vec[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < stepsPerSeg; s++) {
      const t = s / stepsPerSeg;
      const t2 = t * t;
      const t3 = t2 * t;
      const x =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const y =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      out.push([x, y]);
    }
  }
  out.push(pts[pts.length - 1]);
  return 'M' + out.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
}

export function pointAlong(pts: Vec[], prog: number): Vec {
  const segs: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    segs.push(d);
    total += d;
  }
  let target = Math.max(0, Math.min(1, prog)) * total;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i] || i === segs.length - 1) {
      const t = segs[i] === 0 ? 0 : target / segs[i];
      return lerp2(pts[i], pts[i + 1], t);
    }
    target -= segs[i];
  }
  return pts[pts.length - 1];
}
