import test from 'node:test'
import assert from 'node:assert/strict'
import { getCapitalInsight } from '../src/utils/capitalInsight.js'

test('Explica los $102 del ejemplo y dimensiona la única jugada de fútbol', () => {
  const insight = getCapitalInsight(
    [
      { sport: 'Otro', profit: 50, count: 2 },
      { sport: 'Fútbol', profit: 72, count: 1 },
      { sport: 'Béisbol', profit: -20, count: 1 },
    ],
    { invested: 120, profit: 102 }
  )
  assert.match(insight.title, /102\.00/)
  assert.match(insight.detail, /Fútbol aportó .*72\.00 en una sola jugada/)
  assert.match(insight.detail, /120\.00 en 4 jugadas resueltas/)
})

test('Distingue muestra vacía, equilibrio y pérdidas empatadas', () => {
  assert.match(getCapitalInsight([], { profit: 0 }).title, /Aún no hay/)
  const one = { sport: 'Tenis', profit: 0, count: 2 }
  assert.match(getCapitalInsight([one], { invested: 20, profit: 0 }).title, /equilibrio/)
  assert.match(
    getCapitalInsight([{ ...one, profit: -5 }, { ...one, sport: 'Otro', profit: -5 }], {
      invested: 20,
      profit: -10,
    }).detail,
    /empatan en la mayor pérdida/
  )
})
