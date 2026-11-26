import test from 'node:test'
import assert from 'node:assert/strict'
import { accountApi } from '../src/utils/accountStorage.js'

function createMemoryStorage() {
  const map = new Map()
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  }
}

test('Login mockup acepta cualquier credencial y mantiene sesión y bitácora en localStorage', async () => {
  const storage = createMemoryStorage()

  const first = await accountApi({ action: 'login', email: 'cualquier-usuario', password: '123' }, storage)
  assert.equal(first.user.email, 'cualquier-usuario')
  assert.ok(Array.isArray(first.bets) && first.bets.length > 0)

  const customBets = [
    {
      id: 'b1',
      event: 'Prueba',
      sport: 'Tenis',
      selection: 'A',
      date: '2026-11-19',
      stake: 5,
      odds: 2,
      status: 'pending',
    },
  ]

  const updated = await accountApi({ action: 'bets', bets: customBets }, storage)
  assert.deepEqual(updated.bets, customBets)

  const edited = await accountApi({ action: 'profile', alias: 'Luna' }, storage)
  assert.equal(edited.user.alias, 'Luna')

  await accountApi({ action: 'logout' }, storage)
  assert.equal((await accountApi(undefined, storage)).user, null)

  const again = await accountApi({ action: 'login', email: 'cualquier-usuario', password: 'otra' }, storage)
  assert.equal(again.user.alias, 'Luna')
  assert.deepEqual(again.bets, customBets)
})
