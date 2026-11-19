import type { Gym, PlannedExercise, Routine, RoutineTemplate, User } from '../types';

export const seedGyms: Gym[] = [{ id: 'g1', name: 'Forza' }];

export const seedUsers: User[] = [
  { id: 'c1', name: 'Antonella Rocuzzo', role: 'coach', username: 'coach', password: 'coach123', gymIds: ['g1'] },
  { id: 's1', name: 'Juan Pérez', role: 'student', coachId: 'c1', gymId: 'g1', dni: '30111222', daysPerWeek: 3 },
  { id: 's2', name: 'Ana Gómez', role: 'student', coachId: 'c1', gymId: 'g1', dni: '35333444', daysPerWeek: 2 },
  { id: 's3', name: 'Martín Ruiz', role: 'student', coachId: 'c1', gymId: 'g1', dni: '40555666', daysPerWeek: 3 },
];

const ex = (id: string, name: string, sets: number, reps: number, weight: number): PlannedExercise => ({ id, name, sets, reps, weight });

const routine = (id: string, studentId: string, position: number, name: string, exercises: PlannedExercise[]): Routine => ({
  id, coachId: 'c1', studentId, position, name, exercises,
});

export const seedRoutines: Routine[] = [
  routine('r1', 's1', 1, 'Piernas', [
    ex('e1', 'Sentadilla', 4, 8, 60), ex('e2', 'Prensa', 3, 12, 120), ex('e3', 'Estocadas', 3, 10, 12), ex('e4', 'Camilla femoral', 3, 12, 30),
  ]),
  routine('r2', 's1', 2, 'Empuje', [
    ex('e5', 'Press banca', 4, 8, 50), ex('e6', 'Press militar', 3, 10, 25), ex('e7', 'Fondos', 3, 10, 0), ex('e8', 'Tríceps en polea', 3, 12, 20),
  ]),
  routine('r3', 's1', 3, 'Tirón', [
    ex('e9', 'Dominadas', 4, 6, 0), ex('e10', 'Remo con barra', 4, 10, 40), ex('e11', 'Jalón al pecho', 3, 12, 45), ex('e12', 'Curl de bíceps', 3, 12, 10),
  ]),
  routine('r4', 's2', 1, 'Full body A', [
    ex('e13', 'Peso muerto', 4, 6, 70), ex('e14', 'Press banca', 4, 8, 40), ex('e15', 'Remo con mancuerna', 3, 10, 16), ex('e16', 'Plancha', 3, 1, 0),
  ]),
  routine('r5', 's2', 2, 'Full body B', [
    ex('e17', 'Sentadilla', 4, 8, 50), ex('e18', 'Press militar', 3, 10, 20), ex('e19', 'Jalón al pecho', 3, 12, 35), ex('e20', 'Hip thrust', 3, 12, 60),
  ]),
];

export const seedTemplates: RoutineTemplate[] = [
  {
    id: 't1', coachId: 'c1', name: 'Principiante - Full body',
    exercises: [
      ex('te1', 'Sentadilla goblet', 3, 12, 12), ex('te2', 'Press con mancuernas', 3, 12, 10),
      ex('te3', 'Remo en polea', 3, 12, 25), ex('te4', 'Plancha', 3, 1, 0),
    ],
  },
  {
    id: 't2', coachId: 'c1', name: 'Avanzado - Piernas',
    exercises: [
      ex('te5', 'Sentadilla', 5, 5, 90), ex('te6', 'Peso muerto rumano', 4, 8, 70),
      ex('te7', 'Búlgaras', 3, 10, 16), ex('te8', 'Gemelos', 4, 15, 40),
    ],
  },
];
