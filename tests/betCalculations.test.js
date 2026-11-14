import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CalcularROI,
  CalcularResultado,
  EsApuestaValida,
} from '../src/utils/betCalculations.js'

test('EsApuestaValida acepta una apuesta SIMPLE correcta', () => {
  assert.equal(EsApuestaValida('SIMPLE', 10, 2.5), true)
})

test('EsApuestaValida acepta una apuesta EN VIVO correcta', () => {
  assert.equal(EsApuestaValida('EN VIVO', 5, 3), true)
})

test('EsApuestaValida rechaza un monto igual a cero', () => {
  assert.equal(EsApuestaValida('SIMPLE', 0, 2), false)
})

test('EsApuestaValida rechaza una cuota igual a uno', () => {
  assert.equal(EsApuestaValida('SIMPLE', 10, 1), false)
})

test('EsApuestaValida rechaza un tipo no reconocido', () => {
  assert.equal(EsApuestaValida('PARLAY', 10, 2), false)
})

test('CalcularResultado calcula una apuesta ganada', () => {
  assert.equal(CalcularResultado(10, 2.5, true), 15)
})

test('CalcularResultado calcula una apuesta perdida', () => {
  assert.equal(CalcularResultado(20, 1.8, false), -20)
})

test('CalcularResultado calcula otra apuesta ganada', () => {
  assert.equal(CalcularResultado(5, 3, true), 10)
})

test('CalcularROI obtiene -20% para el ejemplo del documento', () => {
  assert.equal(CalcularROI([15, -20, 10, -15], [10, 20, 5, 15]), -20)
})

test('CalcularROI permite un ROI mayor al 100%', () => {
  assert.equal(CalcularROI([30], [10]), 300)
})

test('CalcularROI devuelve cero cuando no hay apuestas', () => {
  assert.equal(CalcularROI([], []), 0)
})
