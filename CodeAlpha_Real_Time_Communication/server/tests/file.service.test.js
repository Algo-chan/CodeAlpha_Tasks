import test from 'node:test'
import assert from 'node:assert/strict'
import { fileService } from '../src/services/file.service.js'

test('FileService Encryption & Signed URLs Unit Tests', async (t) => {
  await t.test('AES-256-GCM roundtrip encryption and decryption', () => {
    const originalText = 'CollabRoom Confidential Document Content 2026'
    const originalBuffer = Buffer.from(originalText, 'utf-8')

    // Encrypt
    const { finalBuffer, iv, encryptedKey } = fileService.encrypt(originalBuffer)

    assert.notEqual(finalBuffer.toString('utf-8'), originalText)
    assert.ok(iv)
    assert.ok(encryptedKey)

    // Decrypt
    const decryptedBuffer = fileService.decrypt(finalBuffer, iv, encryptedKey)
    assert.equal(decryptedBuffer.toString('utf-8'), originalText)
  })

  await t.test('signDownloadToken and verifyDownloadToken validation', () => {
    const fileId = '507f1f77bcf86cd799439099'
    const userId = '507f1f77bcf86cd799439011'

    const token = fileService.signDownloadToken(fileId, userId)
    assert.ok(token)

    const payload = fileService.verifyDownloadToken(token)
    assert.equal(payload.fileId, fileId)
    assert.equal(payload.userId, userId)
  })

  await t.test('verifyDownloadToken rejects invalid token', () => {
    assert.throws(
      () => fileService.verifyDownloadToken('tampered.token.here'),
      (err) => err.name === 'JsonWebTokenError'
    )
  })
})
