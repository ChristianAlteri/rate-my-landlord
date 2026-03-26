/**
 * Google Places request helpers — restrict to United Kingdom geography.
 * Rectangle covers GB + Northern Ireland (excludes Ireland and continental Europe).
 */
export const UK_LOCATION_RESTRICTION = {
  rectangle: {
    low: { latitude: 49.5, longitude: -8.65 },
    high: { latitude: 60.95, longitude: 1.85 },
  },
} as const
