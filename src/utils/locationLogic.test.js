import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findNearestPresetCity,
  formatCoordsLabel,
  formatLocationLabels,
  haversineDistanceKm,
  inferCalculationMethodFromCountry,
  parseNominatimReverseResult,
  parsePhotonReverseResult,
} from './locationLogic.js';
import { CITY_PRESETS } from '../data/cities.js';

test('haversineDistanceKm and findNearestPresetCity identify closest city accurately', () => {
  const makkahToMadinah = haversineDistanceKm(21.4225, 39.8262, 24.4672, 39.6111);
  assert.ok(makkahToMadinah > 320 && makkahToMadinah < 360);

  const nearLondon = findNearestPresetCity(51.515, -0.141, CITY_PRESETS);
  assert.equal(nearLondon.city.id, 'london');
  assert.ok(nearLondon.distanceKm <= 5);
});

test('inferCalculationMethodFromCountry maps regional conventions accurately', () => {
  assert.equal(inferCalculationMethodFromCountry('SA'), 'UmmAlQura');
  assert.equal(inferCalculationMethodFromCountry('us'), 'NorthAmerica');
  assert.equal(inferCalculationMethodFromCountry('CA'), 'NorthAmerica');
  assert.equal(inferCalculationMethodFromCountry('SG'), 'Singapore');
  assert.equal(inferCalculationMethodFromCountry('MY'), 'Singapore');
  assert.equal(inferCalculationMethodFromCountry('PK'), 'Karachi');
  assert.equal(inferCalculationMethodFromCountry('EG'), 'Egyptian');
  assert.equal(inferCalculationMethodFromCountry('AE'), 'Dubai');
  assert.equal(inferCalculationMethodFromCountry('GB'), 'MoonsightingCommittee');
  assert.equal(inferCalculationMethodFromCountry('FR'), 'MuslimWorldLeague');
});

test('parseNominatimReverseResult extracts neighborhood locality, city, region, and method', () => {
  const sample = {
    address: {
      suburb: 'Covent Garden',
      city: 'London',
      state: 'England',
      country: 'United Kingdom',
      country_code: 'gb',
      postcode: 'WC2N 5DU',
    },
  };
  const parsed = parseNominatimReverseResult(sample, 51.5074, -0.1278);
  assert.equal(parsed.locality, 'Covent Garden');
  assert.equal(parsed.cityName, 'London');
  assert.equal(parsed.region, 'England');
  assert.equal(parsed.country, 'United Kingdom');
  assert.equal(parsed.countryCode, 'GB');
  assert.equal(parsed.postcode, 'WC2N 5DU');
  assert.equal(parsed.recommendedMethod, 'MoonsightingCommittee');
});

test('parsePhotonReverseResult extracts locality, city, region, and deduplicates overlapping names', () => {
  const sample = {
    features: [
      {
        properties: {
          district: 'Brooklyn',
          city: 'New York',
          state: 'New York',
          country: 'United States',
          countrycode: 'US',
          postcode: '11201',
        },
      },
    ],
  };
  const parsed = parsePhotonReverseResult(sample, 40.693, -73.989);
  assert.equal(parsed.locality, 'Brooklyn');
  assert.equal(parsed.cityName, 'New York');
  assert.equal(parsed.region, ''); // deduplicated against cityName
  assert.equal(parsed.country, 'United States');
  assert.equal(parsed.recommendedMethod, 'NorthAmerica');
});

test('formatLocationLabels produces concise header labels and rich locality/region lines', () => {
  const labels = formatLocationLabels({
    lat: 51.5074,
    lng: -0.1278,
    locality: 'Covent Garden',
    cityName: 'London',
    region: 'England',
    country: 'United Kingdom',
  });

  assert.equal(labels.localityLine, 'Covent Garden, London');
  assert.equal(labels.shortLabel, 'Covent Garden, London');
  assert.equal(labels.regionLine, 'England, United Kingdom');
  assert.equal(labels.coordsLabel, '51.5074° N, 0.1278° W');

  // Very long neighborhood + city falls back to concise city for compact header
  const longLabels = formatLocationLabels({
    lat: 3.139,
    lng: 101.6869,
    locality: 'Taman Tun Dr Ismail',
    cityName: 'Kuala Lumpur',
    region: 'Federal Territory of Kuala Lumpur',
    country: 'Malaysia',
  });
  assert.equal(longLabels.localityLine, 'Taman Tun Dr Ismail, Kuala Lumpur');
  assert.equal(longLabels.shortLabel, 'Kuala Lumpur');
  assert.equal(formatCoordsLabel(-33.8688, 151.2093), '33.8688° S, 151.2093° E');
});
