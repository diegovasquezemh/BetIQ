import test from 'node:test'
import assert from 'node:assert/strict'
import { getBookmakerPerformance } from '../src/utils/betCalculations.js'

const bet = (bookmaker, status, stake, odds = 2) => ({ bookmaker, status, stake, odds })

test('Agrupa nombres, cuenta resueltas y calcula ROI sobre capital total', () => {
  const result = getBookmakerPerformance([
    bet(' Casa  A ', 'won', 100, 1.5),
    bet('casa a', 'lost', 20),
    bet('Casa B', 'won', 5, 3),
    bet('Casa C', 'lost', 7),
    bet('Casa A', 'pending', 200),
    bet('Casa B', 'void', 50),
    bet('Personal', 'won', 70),
    bet(null, 'lost', 4),
  ])
  assert.deepEqual(result, {
    rows: [
      { name: 'Casa A', count: 2, balance: 30, roi: 25 },
      { name: 'Casa B', count: 1, balance: 10, roi: 200 },
      { name: 'Casa C', count: 1, balance: -7, roi: -100 },
    ],
    withoutBookmaker: 2,
  })
})

test('Una bitácora sin resultados no genera un ranking', () => {
  assert.deepEqual(
    getBookmakerPerformance([bet('Casa A', 'pending', 1), bet('', 'void', 1)]),
    { rows: [], withoutBookmaker: 0 }
  )
})
