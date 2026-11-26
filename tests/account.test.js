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

test('Registro, sesión, perfil y bitácora privada de dos cuentas en localStorage', async () => {
  const storage = createMemoryStorage()
  const signup = {
    action: 'register',
    email: 'test1@example.org',
    alias: '',
    password: 'solo-en-pruebas',
    adult: true,
  }

  await assert.rejects(() => accountApi({ ...signup, adult: false }, storage), { status: 400 })

  const first = await accountApi(signup, storage)
  assert.ok(first.user.adultAt)

  await assert.rejects(() => accountApi(signup, storage), { status: 409 })

  const own = { userId: first.user.id, revision: 0 }
  const bets = [
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

  const updated = await accountApi({ ...own, action: 'bets', bets }, storage)
  assert.deepEqual(updated.bets, bets)

  await assert.rejects(() => accountApi({ ...own, action: 'bets', bets: [] }, storage), { status: 409 })

  const second = await accountApi({ ...signup, email: 'test2@example.org' }, storage)
  assert.deepEqual(second.bets, [])

  await accountApi({ action: 'logout' }, storage)
  assert.equal((await accountApi(undefined, storage)).user, null)

  await assert.rejects(
    () => accountApi({ ...signup, action: 'login', password: 'incorrecta' }, storage),
    { status: 401 }
  )

  const again = await accountApi({ ...signup, action: 'login' }, storage)
  assert.deepEqual(again.bets, bets)

  const edited = await accountApi(
    { userId: again.user.id, revision: again.revision, action: 'profile', alias: 'Luna' },
    storage
  )
  assert.equal(edited.user.alias, 'Luna')
})
