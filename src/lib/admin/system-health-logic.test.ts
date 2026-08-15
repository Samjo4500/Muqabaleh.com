import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  classifyGoogleSpeechHttp,
  classifyGoogleTtsHttp,
  failedCheckLabels,
  overallFromChecks,
  summarizeChecks,
} from './system-health-logic';

describe('system-health-logic', () => {
  it('turns red only when a critical check fails', () => {
    assert.equal(
      overallFromChecks([
        { status: 'pass', critical: true },
        { status: 'warn', critical: false },
      ]),
      'yellow',
    );
    assert.equal(
      overallFromChecks([
        { status: 'fail', critical: true, label: { ar: '', en: 'Speech' } },
        { status: 'pass', critical: true },
      ]),
      'red',
    );
    assert.equal(
      overallFromChecks([
        { status: 'pass', critical: true },
        { status: 'pass', critical: false },
      ]),
      'green',
    );
  });

  it('counts pass/fail and names the failed checks', () => {
    const checks = [
      { status: 'pass' as const, label: { ar: '', en: 'Database' } },
      { status: 'fail' as const, label: { ar: '', en: 'Speech' } },
      { status: 'pass' as const, label: { ar: '', en: 'Gemini AI' } },
    ];
    assert.deepEqual(summarizeChecks(checks), {
      pass: 2,
      fail: 1,
      warn: 0,
      skip: 0,
      total: 3,
    });
    assert.equal(failedCheckLabels(checks), 'Speech');
  });

  it('treats dummy-audio 400 as Speech-to-Text reachable', () => {
    assert.equal(classifyGoogleSpeechHttp(400, 'INVALID_ARGUMENT'), 'reachable');
    assert.equal(classifyGoogleSpeechHttp(200, '{}'), 'reachable');
  });

  it('does not treat Cloud STT API-key rejection as an outage', () => {
    assert.equal(
      classifyGoogleSpeechHttp(
        401,
        'API keys are not supported by this API. Expected OAuth2 access token',
      ),
      'auth_mismatch',
    );
    assert.equal(
      classifyGoogleSpeechHttp(
        403,
        'Cloud Speech-to-Text API has not been used in project X or it is disabled',
      ),
      'auth_mismatch',
    );
  });

  it('treats Cloud TTS 200/400 as reachable', () => {
    assert.equal(classifyGoogleTtsHttp(200, '{"audioContent":"xx"}'), 'reachable');
    assert.equal(classifyGoogleTtsHttp(400, 'INVALID_ARGUMENT'), 'reachable');
    assert.equal(classifyGoogleTtsHttp(401, 'API keys are not supported'), 'auth_mismatch');
  });
});
