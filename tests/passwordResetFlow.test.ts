import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { resolveResetTokenValue, validatePasswordRules } from '../src/api/authApi';

describe('password reset flow helpers', () => {
  it('extracts the reset token from common backend response shapes', () => {
    assert.equal(resolveResetTokenValue({ data: { resetToken: 'abc123' } }), 'abc123');
    assert.equal(resolveResetTokenValue({ token: 'def456' }), 'def456');
    assert.equal(resolveResetTokenValue({ data: { accessToken: 'ghi789' } }), 'ghi789');
    assert.equal(resolveResetTokenValue({}), undefined);
  });

  it('validates strong reset passwords with clear errors', () => {
    assert.deepEqual(validatePasswordRules('Password1!'), []);
    assert.deepEqual(validatePasswordRules('short'), [
      'Use at least 8 characters.',
      'Include at least one uppercase letter.',
      'Include at least one number.',
      'Include at least one special character.',
    ]);
    assert.deepEqual(validatePasswordRules('password'), [
      'Include at least one uppercase letter.',
      'Include at least one number.',
      'Include at least one special character.',
    ]);
  });
});
