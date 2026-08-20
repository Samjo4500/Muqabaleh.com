/** Geographic helpers for the Student 100 MENA hero map. */

export type MenaCapital = {
  code: string;
  name: string;
  lon: number;
  lat: number;
};

/** Capitals for every MENA country on the Student 100 apply list. */
export const MENA_CAPITALS: MenaCapital[] = [
  { code: 'MR', name: 'Nouakchott', lon: -15.98, lat: 18.09 },
  { code: 'MA', name: 'Rabat', lon: -6.83, lat: 34.02 },
  { code: 'DZ', name: 'Algiers', lon: 3.06, lat: 36.75 },
  { code: 'TN', name: 'Tunis', lon: 10.18, lat: 36.81 },
  { code: 'LY', name: 'Tripoli', lon: 13.19, lat: 32.89 },
  { code: 'EG', name: 'Cairo', lon: 31.24, lat: 30.04 },
  { code: 'PS', name: 'Ramallah', lon: 35.2, lat: 31.9 },
  { code: 'LB', name: 'Beirut', lon: 35.5, lat: 33.89 },
  { code: 'SY', name: 'Damascus', lon: 36.29, lat: 33.51 },
  { code: 'JO', name: 'Amman', lon: 35.93, lat: 31.95 },
  { code: 'IQ', name: 'Baghdad', lon: 44.37, lat: 33.31 },
  { code: 'KW', name: 'Kuwait City', lon: 47.98, lat: 29.38 },
  { code: 'BH', name: 'Manama', lon: 50.59, lat: 26.23 },
  { code: 'QA', name: 'Doha', lon: 51.53, lat: 25.29 },
  { code: 'AE', name: 'Abu Dhabi', lon: 54.38, lat: 24.45 },
  { code: 'OM', name: 'Muscat', lon: 58.38, lat: 23.59 },
  { code: 'SA', name: 'Riyadh', lon: 46.68, lat: 24.71 },
  { code: 'YE', name: 'Sanaa', lon: 44.21, lat: 15.35 },
  { code: 'IR', name: 'Tehran', lon: 51.39, lat: 35.69 },
  { code: 'DJ', name: 'Djibouti', lon: 43.15, lat: 11.59 },
];

export const MENA_MAP_VIEW = { width: 1200, height: 640 } as const;

export function projectMena(lon: number, lat: number): { x: number; y: number } {
  const x = ((lon + 18) / 82) * 1120 + 40;
  const y = ((38 - lat) / 27) * 560 + 36;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

/** Simplified coastline (Atlantic Morocco → Levant → Gulf → Yemen → Red Sea → Maghreb). */
export const MENA_COAST: [number, number][] = [
  [-17.0, 20.8],
  [-16.4, 24.2],
  [-14.5, 27.2],
  [-9.7, 31.5],
  [-5.8, 35.8],
  [-1.2, 35.2],
  [3.1, 36.8],
  [8.0, 37.1],
  [10.3, 37.0],
  [11.0, 33.9],
  [13.2, 32.9],
  [16.8, 32.4],
  [20.4, 32.3],
  [25.0, 31.6],
  [29.9, 31.4],
  [32.4, 31.2],
  [34.2, 31.3],
  [35.1, 32.8],
  [35.5, 33.9],
  [36.0, 35.6],
  [36.4, 36.4],
  [40.4, 37.3],
  [44.5, 37.4],
  [48.0, 32.6],
  [48.6, 30.0],
  [50.5, 26.3],
  [51.6, 25.0],
  [54.5, 24.5],
  [56.5, 26.4],
  [58.5, 23.6],
  [59.6, 22.4],
  [57.2, 17.8],
  [53.8, 16.8],
  [48.2, 14.0],
  [44.1, 12.6],
  [43.1, 12.6],
  [42.8, 15.4],
  [39.0, 20.6],
  [36.6, 23.2],
  [34.6, 26.6],
  [32.5, 29.6],
  [29.2, 27.4],
  [24.9, 22.2],
  [16.5, 20.4],
  [10.2, 19.6],
  [3.4, 19.0],
  [-4.8, 16.4],
  [-12.2, 17.6],
  [-16.5, 18.6],
  [-17.0, 20.8],
];

export function pointsToPath(points: [number, number][], close = false): string {
  return points
    .map(([lon, lat], i) => {
      const { x, y } = projectMena(lon, lat);
      return `${i === 0 ? 'M' : 'L'}${x} ${y}`;
    })
    .join(' ')
    .concat(close ? ' Z' : '');
}

export function scaleLonLat(points: [number, number][], factor: number): [number, number][] {
  const cx = 30;
  const cy = 26;
  return points.map(([lon, lat]) => [cx + (lon - cx) * factor, cy + (lat - cy) * factor]);
}

export const MENA_ROUTE: [number, number][] = [
  [-7.6, 33.6],
  [3.06, 36.75],
  [10.18, 36.81],
  [13.19, 32.89],
  [31.24, 30.04],
  [35.93, 31.95],
  [44.37, 33.31],
  [46.68, 24.71],
  [51.53, 25.29],
  [54.38, 24.45],
];
