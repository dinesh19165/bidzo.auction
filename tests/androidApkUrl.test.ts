import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveAndroidApkUrl } from '../src/utils/androidApkUrl';

test('reports a clear unavailable state when the APK URL is missing', () => {
  assert.deepEqual(resolveAndroidApkUrl(), {
    url: null,
    error: 'APK download is not configured yet.',
  });
});

test('accepts an absolute HTTPS APK URL for the install link', () => {
  assert.deepEqual(resolveAndroidApkUrl('https://downloads.example.test/bidzo.apk'), {
    url: 'https://downloads.example.test/bidzo.apk',
    error: null,
  });
});

test('rejects non-HTTPS, homepage, and non-APK URLs', () => {
  for (const url of ['http://downloads.example.test/bidzo.apk', 'https://bidzo.auction/', '/downloads/bidzo.apk', 'https://downloads.example.test/bidzo.zip']) {
    assert.equal(resolveAndroidApkUrl(url).url, null);
  }
});