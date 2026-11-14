export const sampleBets = [
  {
    id: 'bet-001',
    date: '2026-11-02',
    type: 'SIMPLE',
    modality: 'SIMPLE',
    moment: 'ANTES DEL EVENTO',
    sport: 'Fútbol',
    event: 'Real Madrid vs. Valencia',
    market: 'Ganador del partido',
    selection: 'Real Madrid',
    bookmaker: 'Bet365',
    stake: 25,
    odds: 1.8,
    status: 'won',
  },
  {
    id: 'bet-002',
    date: '2026-11-05',
    type: 'COMBINADA',
    modality: 'COMBINADA',
    moment: 'ANTES DEL EVENTO',
    sport: 'Combinada',
    event: 'Lakers vs. Suns + Arsenal vs. Chelsea',
    market: '2 selecciones',
    selection: 'Más de 224.5 + Arsenal',
    bookmaker: 'Betway',
    stake: 18,
    odds: 2.1,
    status: 'lost',
    legs: [
      { id: 'leg-201', sport: 'Baloncesto', event: 'Lakers vs. Suns', market: 'Total de puntos', selection: 'Más de 224.5', odds: 1.4 },
      { id: 'leg-202', sport: 'Fútbol', event: 'Arsenal vs. Chelsea', market: 'Ganador', selection: 'Arsenal', odds: 1.5 },
    ],
  },
  {
    id: 'bet-003',
    date: '2026-11-09',
    type: 'EN VIVO',
    modality: 'SIMPLE',
    moment: 'EN VIVO',
    sport: 'Fútbol',
    event: 'Arsenal vs. Chelsea',
    market: 'Ambos anotan',
    selection: 'Sí',
    bookmaker: 'Bet365',
    stake: 20,
    odds: 1.95,
    status: 'won',
    liveMinute: 'Minuto 62',
    liveScore: '1 - 1',
  },
  {
    id: 'bet-004',
    date: '2026-11-13',
    type: 'SIMPLE',
    modality: 'SIMPLE',
    moment: 'ANTES DEL EVENTO',
    sport: 'Tenis',
    event: 'ATP Finals',
    market: 'Ganador del partido',
    selection: 'Jugador local',
    bookmaker: '1xBet',
    stake: 15,
    odds: 2.35,
    status: 'pending',
  },
]

export const sports = ['Fútbol', 'Baloncesto', 'Tenis', 'Béisbol', 'Otro']

export const betModalities = ['SIMPLE', 'COMBINADA']

export const betMoments = ['ANTES DEL EVENTO', 'EN VIVO', 'EVENTO FINALIZADO']

export const statusLabels = {
  won: 'Ganada',
  lost: 'Perdida',
  pending: 'Pendiente',
  void: 'Anulada',
}
