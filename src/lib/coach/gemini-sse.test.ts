import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  consumeGeminiSseBuffer,
  extractTextFromGeminiChunk,
  mergeGeminiStreamText,
} from './gemini-sse';
import { applyCoachTurnSseChunk } from './turn-stream';

describe('gemini stream merge', () => {
  it('treats chunks as deltas by default', () => {
    const first = mergeGeminiStreamText('', 'Hi');
    assert.deepEqual(first, { next: 'Hi', delta: 'Hi' });
    const second = mergeGeminiStreamText(first.next, ' there');
    assert.deepEqual(second, { next: 'Hi there', delta: ' there' });
  });

  it('dedupes snapshot-style chunks', () => {
    const merged = mergeGeminiStreamText('Hi', 'Hi there');
    assert.deepEqual(merged, { next: 'Hi there', delta: ' there' });
    const dup = mergeGeminiStreamText('Hi there', ' there');
    assert.deepEqual(dup, { next: 'Hi there', delta: '' });
  });

  it('extracts candidate text from a Gemini chunk', () => {
    assert.equal(
      extractTextFromGeminiChunk({
        candidates: [{ content: { parts: [{ text: 'Hello' }, { text: '!' }] } }],
      }),
      'Hello!',
    );
    assert.equal(extractTextFromGeminiChunk(null), '');
  });

  it('parses SSE data frames from Gemini', () => {
    const texts: string[] = [];
    const rest = consumeGeminiSseBuffer(
      '',
      'data: {"candidates":[{"content":{"parts":[{"text":"Hi"}]}}]}\n\npartial',
      (t) => texts.push(t),
    );
    assert.deepEqual(texts, ['Hi']);
    assert.equal(rest, 'partial');
  });
});

describe('coach turn SSE', () => {
  it('fans token/done events out to handlers', () => {
    const tokens: string[] = [];
    let doneReply = '';
    const rest = applyCoachTurnSseChunk(
      '',
      'event: token\ndata: {"text":"Jeannie"}\n\nevent: done\ndata: {"reply":"Jeannie is ready","complete":false}\n\n',
      {
        onToken: (t) => tokens.push(t),
        onDone: (d) => {
          doneReply = d.reply || '';
        },
      },
    );
    assert.deepEqual(tokens, ['Jeannie']);
    assert.equal(doneReply, 'Jeannie is ready');
    assert.equal(rest, '');
  });
});
