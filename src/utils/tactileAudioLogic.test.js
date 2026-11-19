import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TACTILE_AUDIO_CUES,
  computeCardFlipAudioPlan,
  computeCardRippleAudioPlan,
  resolveMaterialAudioProfile,
  shouldThrottleAudioCue,
} from './tactileAudioLogic.js';

test('resolveMaterialAudioProfile resolves known finishes and defaults safely', () => {
  assert.equal(resolveMaterialAudioProfile('obsidian').id, 'obsidian');
  assert.equal(resolveMaterialAudioProfile('emerald').id, 'emerald');
  assert.equal(resolveMaterialAudioProfile('parchment').id, 'parchment');
  assert.equal(resolveMaterialAudioProfile('unknown').id, 'obsidian');
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

test('computeCardRippleAudioPlan maps pointer coordinates to smooth pitch and clamped stereo pan', () => {
  const topLeft = computeCardRippleAudioPlan({ xPct: 0, yPct: 0, finish: 'emerald' });
  const bottomRight = computeCardRippleAudioPlan({ xPct: 100, yPct: 100, finish: 'emerald' });
  const center = computeCardRippleAudioPlan({ xPct: 50, yPct: 50, finish: 'obsidian' });

  assert.equal(center.cue, TACTILE_AUDIO_CUES.CARD_RIPPLE);
  assert.equal(center.pan, 0);
  assert.ok(topLeft.pan < 0 && topLeft.pan >= -0.35);
  assert.ok(bottomRight.pan > 0 && bottomRight.pan <= 0.35);

  // Higher tap (y=0) with same x yields brighter pitch than lower tap (y=100)
  const topMid = computeCardRippleAudioPlan({ xPct: 50, yPct: 0, finish: 'parchment' });
  const bottomMid = computeCardRippleAudioPlan({ xPct: 50, yPct: 100, finish: 'parchment' });
  assert.ok(topMid.baseFreq > bottomMid.baseFreq);

  // Guards non-finite and out-of-range inputs safely
  const guarded = computeCardRippleAudioPlan({ xPct: Number.NaN, yPct: 999, finish: null });
  assert.equal(guarded.pan, 0);
  assert.ok(Number.isFinite(guarded.baseFreq) && guarded.baseFreq > 350 && guarded.baseFreq < 600);
});

test('shouldThrottleAudioCue enforces cooldown windows cleanly', () => {
  assert.equal(shouldThrottleAudioCue(TACTILE_AUDIO_CUES.CARD_FLIP, undefined, 1000), false);
  assert.equal(shouldThrottleAudioCue(TACTILE_AUDIO_CUES.CARD_FLIP, 1000, 1080), true);
  assert.equal(shouldThrottleAudioCue(TACTILE_AUDIO_CUES.CARD_FLIP, 1000, 1200), false);

  assert.equal(shouldThrottleAudioCue(TACTILE_AUDIO_CUES.CARD_RIPPLE, 1000, 1030), true);
  assert.equal(shouldThrottleAudioCue(TACTILE_AUDIO_CUES.CARD_RIPPLE, 1000, 1090), false);
});
