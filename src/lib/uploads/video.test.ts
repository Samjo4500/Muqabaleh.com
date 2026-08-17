import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  INLINE_VIDEO_MAX_BYTES,
  assertVideoFile,
  isAllowedVideoMime,
} from './video';

describe('video upload rules', () => {
  it('accepts mp4 / webm / mov by mime or extension', () => {
    assert.equal(isAllowedVideoMime('video/mp4', 'intro.mp4'), true);
    assert.equal(isAllowedVideoMime('video/quicktime', 'intro.mov'), true);
    assert.equal(isAllowedVideoMime('application/octet-stream', 'clip.mp4'), true);
    assert.equal(isAllowedVideoMime('image/jpeg', 'photo.jpg'), false);
  });

  it('rejects oversized inline uploads', () => {
    assert.throws(
      () =>
        assertVideoFile({
          mimeType: 'video/mp4',
          filename: 'long.mp4',
          size: INLINE_VIDEO_MAX_BYTES + 1,
          maxBytes: INLINE_VIDEO_MAX_BYTES,
        }),
      /under/,
    );
    assert.doesNotThrow(() =>
      assertVideoFile({
        mimeType: 'video/mp4',
        filename: 'short.mp4',
        size: 800_000,
        maxBytes: INLINE_VIDEO_MAX_BYTES,
      }),
    );
  });
});
