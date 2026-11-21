import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TACTILE_AUDIO_CUES,
  computeCardFlipAudioPlan,
  resolveBadgeAudioCue,
  resolveMaterialAudioProfile,
  shouldThrottleAudioCue,
} from './tactileAudioLogic.js';

test('resolveMaterialAudioProfile resolves known finishes and defaults safely', () => {
  assert.equal(resolveMaterialAudioProfile('obsidian').id, 'obsidian');
  assert.equal(resolveMaterialAudioProfile('emerald').id, 'emerald');
  assert.equal(resolveMaterialAudioProfile('parchment').id, 'parchment');
  assert.equal(resolveMaterialAudioProfile('unknown').id, 'obsidian');
});

test('resolveBadgeAudioCue maps all badge tiers accurately', () => {
  assert.equal(resolveBadgeAudioCue('bronze'), TACTILE_AUDIO_CUES.BADGE_BRONZE);
  assert.equal(resolveBadgeAudioCue('silver'), TACTILE_AUDIO_CUES.BADGE_SILVER);
  assert.equal(resolveBadgeAudioCue('GOLD'), TACTILE_AUDIO_CUES.BADGE_GOLD);
  assert.equal(resolveBadgeAudioCue('platinum'), TACTILE_AUDIO_CUES.BADGE_PLATINUM);
  assert.equal(resolveBadgeAudioCue('unknown'), TACTILE_AUDIO_CUES.BADGE_BRONZE);
});

test('computeCardFlipAudioPlan produces distinct directional sweeps with subtle non-clipping gains', () => {
  const toRecords = computeCardFlipAudioPlan({ toFlipped: true, finish: 'obsidian' });
  const toFront = computeCardFlipAudioPlan({ toFlipped: false, finish: 'obsidian' });

  assert.equal(toRecords.cue, TACTILE_AUDIO_CUES.CARD_FLIP);
  assert.equal(toRecords.direction, 'to-records');
  assert.equal(toFront.direction, 'to-front');

  // Ascending settle when revealing records, warmer grounded settle returning to front
  assert.ok(toRecords.settle.rootHz > toRecords.settle.leadHz);
  assert.ok(toFront.settle.rootHz < toFront.settle.leadHz);

  // Parchment has slightly crisper brush gain than obsidian while staying whisper-subtle
  const parchment = computeCardFlipAudioPlan({ toFlipped: true, finish: 'parchment' });
  assert.ok(parchment.brush.peakGain > toRecords.brush.peakGain);
  assert.ok(parchment.brush.peakGain < 0.05);
  assert.ok(toRecords.settle.peakGain < 0.03);
});

test('shouldThrottleAudioCue enforces cooldown windows cleanly', () => {
  assert.equal(shouldThrottleAudioCue(TACTILE_AUDIO_CUES.CARD_FLIP, undefined, 1000), false);
  assert.equal(shouldThrottleAudioCue(TACTILE_AUDIO_CUES.CARD_FLIP, 1000, 1080), true);
  assert.equal(shouldThrottleAudioCue(TACTILE_AUDIO_CUES.CARD_FLIP, 1000, 1200), false);

  assert.equal(shouldThrottleAudioCue(TACTILE_AUDIO_CUES.PRAYER_TOGGLE, 1000, 1020), true);
  assert.equal(shouldThrottleAudioCue(TACTILE_AUDIO_CUES.PRAYER_TOGGLE, 1000, 1060), false);

  assert.equal(shouldThrottleAudioCue(TACTILE_AUDIO_CUES.PRAYER_TASK_TICKOFF, 1000, 1040), true);
  assert.equal(shouldThrottleAudioCue(TACTILE_AUDIO_CUES.PRAYER_TASK_TICKOFF, 1000, 1085), false);

  assert.equal(shouldThrottleAudioCue(TACTILE_AUDIO_CUES.BADGE_GOLD, 1000, 1150), true);
  assert.equal(shouldThrottleAudioCue(TACTILE_AUDIO_CUES.BADGE_GOLD, 1000, 1260), false);
});
