import type { Routine, RoutineTemplate, User } from '../types';
import { addDays, startOfWeek, today } from '../lib/dates';

export const seedUsers: User[] = [
  { id: 'c1', name: 'Coach Laura', role: 'coach' },
  { id: 's1', name: 'Juan Pérez', role: 'student', coachId: 'c1' },
  { id: 's2', name: 'Ana Gómez', role: 'student', coachId: 'c1' },
  { id: 's3', name: 'Martín Ruiz', role: 'student', coachId: 'c1' },
];

export function seedRoutines(): Routine[] {
  const monday = startOfWeek(today());
  return [
    {
      id: 'r1', coachId: 'c1', studentId: 's1', date: monday, name: 'Día A - Piernas',
      exercises: [
        { id: 'e1', name: 'Sentadilla', sets: 4, reps: 8, weight: 60 },
        { id: 'e2', name: 'Prensa', sets: 3, reps: 12, weight: 120 },
        { id: 'e3', name: 'Estocadas', sets: 3, reps: 10, weight: 12 },
      ],
    },
    {
      id: 'r2', coachId: 'c1', studentId: 's1', date: addDays(monday, 2), name: 'Día B - Empuje',
      exercises: [
        { id: 'e4', name: 'Press banca', sets: 4, reps: 8, weight: 50 },
        { id: 'e5', name: 'Press militar', sets: 3, reps: 10, weight: 25 },
        { id: 'e6', name: 'Fondos', sets: 3, reps: 10, weight: 0 },
      ],
    },
    {
      id: 'r3', coachId: 'c1', studentId: 's1', date: today(), name: 'Día C - Tirón',
      exercises: [
        { id: 'e7', name: 'Dominadas', sets: 4, reps: 6, weight: 0 },
        { id: 'e8', name: 'Remo con barra', sets: 4, reps: 10, weight: 40 },
      ],
    },
    {
      id: 'r4', coachId: 'c1', studentId: 's2', date: today(), name: 'Full body',
      exercises: [
        { id: 'e9', name: 'Peso muerto', sets: 4, reps: 6, weight: 70 },
        { id: 'e10', name: 'Press banca', sets: 4, reps: 8, weight: 40 },
      ],
    },
  ];
}

export const seedTemplates: RoutineTemplate[] = [
  {
    id: 't1', coachId: 'c1', name: 'Principiante - Full body',
    exercises: [
      { id: 'te1', name: 'Sentadilla goblet', sets: 3, reps: 12, weight: 12 },
      { id: 'te2', name: 'Press con mancuernas', sets: 3, reps: 12, weight: 10 },
      { id: 'te3', name: 'Remo en polea', sets: 3, reps: 12, weight: 25 },
    ],
  },
  {
    id: 't2', coachId: 'c1', name: 'Avanzado - Piernas',
    exercises: [
      { id: 'te4', name: 'Sentadilla', sets: 5, reps: 5, weight: 90 },
      { id: 'te5', name: 'Peso muerto rumano', sets: 4, reps: 8, weight: 70 },
      { id: 'te6', name: 'Búlgaras', sets: 3, reps: 10, weight: 16 },
    ],
  },
];
