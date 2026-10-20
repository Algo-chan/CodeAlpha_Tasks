import test from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import { authService } from '../src/services/auth.service.js'
import config from '../src/config/env.js'

test('AuthService Unit Tests', async (t) => {
  await t.test('hashPassword & comparePassword with 12 bcrypt rounds', async () => {
    const password = 'SuperSecretPassword2026!'
    const hash = await authService.hashPassword(password)

    assert.notEqual(hash, password)
    assert.equal(typeof hash, 'string')
    assert.ok(hash.startsWith('$2'))

    const isMatch = await authService.comparePassword(password, hash)
    assert.equal(isMatch, true)

    const isWrongMatch = await authService.comparePassword('WrongPassword!', hash)
    assert.equal(isWrongMatch, false)
  })

  await t.test('generateTokens creates valid access and refresh tokens', () => {
    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      email: 'testuser@collabroom.internal',
      name: 'Test User',
    }

    const { accessToken, refreshToken } = authService.generateTokens(mockUser)

    assert.ok(accessToken)
    assert.ok(refreshToken)

    // Decode and verify access token payload
    const decodedAccess = authService.verifyAccessToken(accessToken)
    assert.equal(decodedAccess.userId, mockUser._id)
    assert.equal(decodedAccess.email, mockUser.email)
    assert.equal(decodedAccess.name, mockUser.name)

    // Verify refresh token with refresh secret
    const decodedRefresh = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET)
    assert.equal(decodedRefresh.userId, mockUser._id)
  })

  await t.test('verifyAccessToken rejects tampered tokens', () => {
    assert.throws(
      () => authService.verifyAccessToken('invalid.token.here'),
      (err) => err.name === 'JsonWebTokenError'
    )
  })
})
