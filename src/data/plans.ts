import { getExercise } from './exercises';

export type Level = 'principiante' | 'intermedio' | 'avanzado';

export const LEVELS: { id: Level; label: string; summary: string }[] = [
  { id: 'principiante', label: 'Principiante', summary: 'Máquinas y mancuernas, 3 series de 12 a 15 repeticiones. Ideal 2 o 3 días.' },
  { id: 'intermedio', label: 'Intermedio', summary: 'Suma barra y fondos, 3 a 4 series de 8 a 12. Ideal 3 a 5 días.' },
  { id: 'avanzado', label: 'Avanzado', summary: 'Dominadas y más volumen, 4 a 5 series de 6 a 12. Ideal 4 a 6 días.' },
];

export interface PlanExercise {
  exerciseId: string;
  sets: number;
  reps: number;
}

export interface PlanRoutine {
  name: string;
  exercises: PlanExercise[];
}

/** A ready-made set of routines for a level and a number of gym days a week: one routine per day. */
export interface Plan {
  id: string;
  level: Level;
  days: number;
  note?: string;
  routines: PlanRoutine[];
}

const BENCH = 'Barbell_Bench_Press_-_Medium_Grip';
const DB_BENCH = 'Dumbbell_Bench_Press';
const INCLINE = 'Incline_Dumbbell_Press';
const PEC_DECK = 'Butterfly';
const PULLDOWN = 'Wide-Grip_Lat_Pulldown';
const PULLUP = 'Pullups';
const MACHINE_ROW = 'Leverage_Iso_Row';
const DB_ROW = 'One-Arm_Dumbbell_Row';
const LATERAL = 'Side_Lateral_Raise';
const FRONT = 'Front_Dumbbell_Raise';
const MILITARY = 'Standing_Military_Press';
const HAMMER = 'Hammer_Curls';
const CURL = 'Dumbbell_Bicep_Curl';
const INCLINE_CURL = 'Incline_Dumbbell_Curl';
const OVERHEAD_EXT = 'Standing_Dumbbell_Triceps_Extension';
const DIPS = 'Dips_-_Triceps_Version';
const LEG_PRESS = 'Leg_Press';
const SQUAT = 'Dumbbell_Squat';
const LEG_CURL = 'Seated_Leg_Curl';
const LEG_EXT = 'Leg_Extensions';
const CALF = 'Standing_Dumbbell_Calf_Raise';

type Entry = [exerciseId: string, sets: number, reps: number];

const routine = (name: string, entries: Entry[]): PlanRoutine => ({
  name,
  exercises: entries.map(([exerciseId, sets, reps]) => ({ exerciseId, sets, reps })),
});

// ---------- Principiante: máquinas y mancuernas, sin dominadas, barra ni fondos ----------

const P = {
  fullBody: routine('Full body', [[LEG_PRESS, 3, 12], [DB_BENCH, 3, 12], [PULLDOWN, 3, 12], [MACHINE_ROW, 3, 12], [LATERAL, 3, 12], [LEG_CURL, 3, 12]]),
  fullBodyA: routine('Full body A', [[LEG_PRESS, 3, 12], [DB_BENCH, 3, 12], [PULLDOWN, 3, 12], [LATERAL, 3, 12], [CURL, 3, 12], [OVERHEAD_EXT, 3, 12]]),
  fullBodyB: routine('Full body B', [[SQUAT, 3, 12], [MACHINE_ROW, 3, 12], [PEC_DECK, 3, 12], [LEG_CURL, 3, 12], [HAMMER, 3, 12], [CALF, 3, 15]]),
  fullBodyC: routine('Full body C', [[LEG_PRESS, 3, 12], [INCLINE, 3, 12], [DB_ROW, 3, 12], [LEG_EXT, 3, 12], [FRONT, 3, 12], [OVERHEAD_EXT, 3, 12]]),
  upperA: routine('Tren superior A', [[DB_BENCH, 3, 12], [PULLDOWN, 3, 12], [PEC_DECK, 3, 12], [MACHINE_ROW, 3, 12], [LATERAL, 3, 12], [CURL, 3, 12], [OVERHEAD_EXT, 3, 12]]),
  upperB: routine('Tren superior B', [[INCLINE, 3, 12], [DB_ROW, 3, 12], [PULLDOWN, 3, 12], [FRONT, 3, 12], [HAMMER, 3, 12], [OVERHEAD_EXT, 3, 12]]),
  lowerA: routine('Piernas A', [[LEG_PRESS, 3, 12], [LEG_EXT, 3, 12], [LEG_CURL, 3, 12], [CALF, 3, 15]]),
  lowerB: routine('Piernas B', [[SQUAT, 3, 12], [LEG_CURL, 3, 12], [LEG_EXT, 3, 12], [CALF, 3, 15]]),
  light: routine('Full body liviano', [[LEG_PRESS, 2, 15], [PEC_DECK, 2, 15], [MACHINE_ROW, 2, 15], [LATERAL, 2, 15], [CALF, 2, 15]]),
  armsShoulders: routine('Hombros y brazos', [[LATERAL, 3, 15], [FRONT, 3, 12], [CURL, 3, 12], [HAMMER, 3, 12], [OVERHEAD_EXT, 3, 12]]),
};

// ---------- Intermedio: suma barra y fondos, divide por grupos ----------

const I = {
  fullBody: routine('Full body', [[BENCH, 4, 8], [LEG_PRESS, 4, 10], [PULLDOWN, 4, 10], [MILITARY, 3, 10], [DB_ROW, 3, 10], [LEG_CURL, 3, 12]]),
  fullBodyA: routine('Full body A', [[BENCH, 4, 8], [LEG_PRESS, 4, 10], [PULLDOWN, 4, 10], [LATERAL, 3, 12], [CURL, 3, 10], [OVERHEAD_EXT, 3, 12]]),
  fullBodyB: routine('Full body B', [[SQUAT, 4, 10], [INCLINE, 4, 10], [MACHINE_ROW, 4, 10], [MILITARY, 3, 10], [LEG_CURL, 3, 12], [HAMMER, 3, 12]]),
  pushA: routine('Empuje A', [[BENCH, 4, 8], [INCLINE, 3, 10], [PEC_DECK, 3, 12], [MILITARY, 3, 10], [LATERAL, 3, 12], [OVERHEAD_EXT, 3, 12]]),
  pushB: routine('Empuje B', [[DB_BENCH, 4, 10], [INCLINE, 3, 10], [DIPS, 3, 10], [MILITARY, 3, 10], [FRONT, 3, 12], [OVERHEAD_EXT, 3, 12]]),
  pullA: routine('Tirón A', [[PULLDOWN, 4, 10], [MACHINE_ROW, 4, 10], [DB_ROW, 3, 10], [CURL, 3, 10], [HAMMER, 3, 12]]),
  pullB: routine('Tirón B', [[DB_ROW, 4, 10], [PULLDOWN, 4, 12], [MACHINE_ROW, 3, 12], [INCLINE_CURL, 3, 10], [HAMMER, 3, 12]]),
  legsA: routine('Piernas A', [[LEG_PRESS, 4, 10], [SQUAT, 3, 10], [LEG_EXT, 3, 12], [LEG_CURL, 3, 12], [CALF, 4, 15]]),
  legsB: routine('Piernas B', [[SQUAT, 4, 10], [LEG_CURL, 4, 12], [LEG_PRESS, 3, 12], [LEG_EXT, 3, 12], [CALF, 4, 15]]),
  upperA: routine('Tren superior A', [[BENCH, 4, 8], [PULLDOWN, 4, 10], [INCLINE, 3, 10], [MACHINE_ROW, 3, 10], [LATERAL, 3, 12], [CURL, 3, 10], [OVERHEAD_EXT, 3, 12]]),
  upperB: routine('Tren superior B', [[DB_BENCH, 4, 10], [DB_ROW, 4, 10], [PEC_DECK, 3, 12], [PULLDOWN, 3, 12], [MILITARY, 3, 10], [HAMMER, 3, 12], [DIPS, 3, 10]]),
  armsShoulders: routine('Hombros y brazos', [[MILITARY, 3, 10], [LATERAL, 3, 12], [FRONT, 3, 12], [INCLINE_CURL, 3, 10], [HAMMER, 3, 12], [OVERHEAD_EXT, 3, 12], [DIPS, 3, 10]]),
};

// ---------- Avanzado: dominadas, más series y rutinas por grupo muscular ----------

const A = {
  fullBody: routine('Full body', [[BENCH, 4, 6], [LEG_PRESS, 4, 8], [PULLUP, 4, 8], [MILITARY, 4, 8], [DB_ROW, 3, 10], [LEG_CURL, 3, 10], [DIPS, 3, 10]]),
  fullBodyA: routine('Full body A', [[BENCH, 4, 6], [LEG_PRESS, 4, 8], [PULLUP, 4, 8], [LATERAL, 4, 12], [CURL, 3, 10], [OVERHEAD_EXT, 3, 10]]),
  fullBodyB: routine('Full body B', [[SQUAT, 4, 8], [MILITARY, 4, 8], [MACHINE_ROW, 4, 8], [INCLINE, 3, 10], [LEG_CURL, 4, 10], [DIPS, 3, 10]]),
  pushA: routine('Empuje A', [[BENCH, 5, 6], [INCLINE, 4, 8], [PEC_DECK, 3, 12], [MILITARY, 4, 8], [LATERAL, 4, 12], [DIPS, 3, 10], [OVERHEAD_EXT, 3, 12]]),
  pushB: routine('Empuje B', [[DB_BENCH, 4, 8], [INCLINE, 4, 10], [DIPS, 4, 10], [MILITARY, 4, 8], [FRONT, 3, 12], [OVERHEAD_EXT, 3, 12]]),
  pullA: routine('Tirón A', [[PULLUP, 4, 8], [PULLDOWN, 4, 10], [MACHINE_ROW, 4, 8], [DB_ROW, 3, 10], [INCLINE_CURL, 3, 10], [HAMMER, 3, 12]]),
  pullB: routine('Tirón B', [[DB_ROW, 4, 8], [PULLUP, 4, 8], [MACHINE_ROW, 3, 10], [PULLDOWN, 3, 12], [HAMMER, 4, 10], [CURL, 3, 10]]),
  legsA: routine('Piernas A', [[LEG_PRESS, 5, 8], [SQUAT, 4, 10], [LEG_EXT, 4, 12], [LEG_CURL, 4, 10], [CALF, 5, 15]]),
  legsB: routine('Piernas B', [[SQUAT, 4, 10], [LEG_PRESS, 4, 10], [LEG_CURL, 4, 12], [LEG_EXT, 4, 12], [CALF, 5, 15]]),
  chestTriceps: routine('Pecho y tríceps', [[BENCH, 5, 6], [DB_BENCH, 4, 8], [INCLINE, 4, 10], [PEC_DECK, 3, 12], [DIPS, 4, 10], [OVERHEAD_EXT, 3, 12]]),
  backBiceps: routine('Espalda y bíceps', [[PULLUP, 4, 8], [PULLDOWN, 4, 10], [MACHINE_ROW, 4, 8], [DB_ROW, 4, 10], [CURL, 3, 10], [INCLINE_CURL, 3, 10], [HAMMER, 3, 12]]),
  shouldersArms: routine('Hombros y brazos', [[MILITARY, 5, 6], [LATERAL, 4, 12], [FRONT, 3, 12], [CURL, 3, 10], [HAMMER, 3, 12], [OVERHEAD_EXT, 3, 12], [DIPS, 3, 10]]),
  chest: routine('Pecho', [[BENCH, 5, 6], [DB_BENCH, 4, 8], [INCLINE, 4, 10], [PEC_DECK, 4, 12], [DIPS, 3, 10]]),
  back: routine('Espalda', [[PULLUP, 4, 8], [PULLDOWN, 4, 10], [MACHINE_ROW, 4, 8], [DB_ROW, 4, 10]]),
  shoulders: routine('Hombros', [[MILITARY, 5, 6], [LATERAL, 4, 12], [FRONT, 4, 12], [CALF, 4, 15]]),
  arms: routine('Brazos', [[CURL, 4, 10], [INCLINE_CURL, 3, 10], [HAMMER, 3, 12], [OVERHEAD_EXT, 4, 12], [DIPS, 4, 10]]),
};

const MANY_DAYS = 'Con 6 o 7 días, el último conviene hacerlo con menos peso para recuperar.';

export const PLANS: Plan[] = [
  { level: 'principiante', days: 1, routines: [P.fullBody] },
  { level: 'principiante', days: 2, routines: [P.fullBodyA, P.fullBodyB] },
  { level: 'principiante', days: 3, routines: [P.fullBodyA, P.fullBodyB, P.fullBodyC] },
  { level: 'principiante', days: 4, routines: [P.upperA, P.lowerA, P.upperB, P.lowerB] },
  { level: 'principiante', days: 5, note: 'Para un principiante recomendamos hasta 4 días. El quinto es un full body liviano.', routines: [P.upperA, P.lowerA, P.upperB, P.lowerB, P.light] },
  { level: 'principiante', days: 6, note: 'Para un principiante recomendamos hasta 4 días. Los días extra son livianos.', routines: [P.upperA, P.lowerA, P.upperB, P.lowerB, P.armsShoulders, P.light] },
  { level: 'principiante', days: 7, note: 'Para un principiante recomendamos hasta 4 días. Los días extra son livianos.', routines: [P.upperA, P.lowerA, P.upperB, P.lowerB, P.fullBodyC, P.armsShoulders, P.light] },

  { level: 'intermedio', days: 1, routines: [I.fullBody] },
  { level: 'intermedio', days: 2, routines: [I.fullBodyA, I.fullBodyB] },
  { level: 'intermedio', days: 3, routines: [I.pushA, I.pullA, I.legsA] },
  { level: 'intermedio', days: 4, routines: [I.upperA, I.legsA, I.upperB, I.legsB] },
  { level: 'intermedio', days: 5, routines: [I.upperA, I.legsA, I.pushB, I.pullB, I.legsB] },
  { level: 'intermedio', days: 6, note: MANY_DAYS, routines: [I.pushA, I.pullA, I.legsA, I.pushB, I.pullB, I.legsB] },
  { level: 'intermedio', days: 7, note: MANY_DAYS, routines: [I.pushA, I.pullA, I.legsA, I.pushB, I.pullB, I.legsB, I.armsShoulders] },

  { level: 'avanzado', days: 1, routines: [A.fullBody] },
  { level: 'avanzado', days: 2, routines: [A.fullBodyA, A.fullBodyB] },
  { level: 'avanzado', days: 3, routines: [A.pushA, A.pullA, A.legsA] },
  { level: 'avanzado', days: 4, routines: [A.chestTriceps, A.backBiceps, A.legsA, A.shouldersArms] },
  { level: 'avanzado', days: 5, routines: [A.chest, A.back, A.legsA, A.shoulders, A.arms] },
  { level: 'avanzado', days: 6, note: MANY_DAYS, routines: [A.pushA, A.pullA, A.legsA, A.pushB, A.pullB, A.legsB] },
  { level: 'avanzado', days: 7, note: MANY_DAYS, routines: [A.pushA, A.pullA, A.legsA, A.pushB, A.pullB, A.legsB, A.shouldersArms] },
].map((p) => ({ ...p, id: `${p.level}-${p.days}` }) as Plan);

export const planFor = (level: Level, days: number) => PLANS.find((p) => p.level === level && p.days === days);

for (const plan of PLANS) {
  for (const r of plan.routines) {
    for (const e of r.exercises) {
      if (!getExercise(e.exerciseId)) throw new Error(`Plan ${plan.id}: unknown exercise ${e.exerciseId}`);
    }
  }
}
