import type { PlannedExercise } from '../types';

export type Muscle = 'Pecho' | 'Espalda' | 'Hombros' | 'Bíceps' | 'Tríceps' | 'Piernas' | 'Abdomen' | 'Cardio y funcional';

export const MUSCLES: Muscle[] = ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Piernas', 'Abdomen', 'Cardio y funcional'];

/**
 * Exercises available in the app. `id` and `name` are the ones in free-exercise-db
 * (https://github.com/yuhonas/free-exercise-db, public domain), which also gives the start and end
 * photos in public/exercises/<id>/. The descriptions are our own.
 */
export interface Exercise {
  id: string;
  name: string;
  /** How the gym calls it. */
  alias: string;
  /** Other names coaches type for the same exercise. */
  otherNames?: string[];
  muscle: Muscle;
  images: [string, string];
  description: string;
}

const exercise = (id: string, name: string, alias: string, muscle: Muscle, description: string): Exercise => ({
  id,
  name,
  alias,
  muscle,
  images: [`/exercises/${id}/0.jpg`, `/exercises/${id}/1.jpg`],
  description,
});

export const EXERCISES: Exercise[] = [
  exercise('Barbell_Bench_Press_-_Medium_Grip', 'Barbell Bench Press - Medium Grip', 'Press de banco plano con barra', 'Pecho',
    'Acostado en el banco plano, con los pies firmes en el piso, tomá la barra un poco más ancho que los hombros. Bajala controlada hasta rozar la mitad del pecho, con los codos a unos 45° del cuerpo, y empujá hasta estirar los brazos sin trabar los codos.'),
  exercise('Dumbbell_Bench_Press', 'Dumbbell Bench Press', 'Press en banco plano con mancuernas', 'Pecho',
    'Acostado en el banco plano, con una mancuerna en cada mano a la altura del pecho y las palmas hacia los pies. Empujá hacia arriba hasta que se acerquen sobre el pecho y bajá despacio hasta sentir el estiramiento del pecho.'),
  exercise('Incline_Dumbbell_Press', 'Incline Dumbbell Press', 'Press en banco inclinado con mancuernas', 'Pecho',
    'Con el banco inclinado a 30–45°, apoyá bien la espalda y llevá las mancuernas a los costados del pecho. Empujá hacia arriba y un poco hacia adentro, y bajá controlado. Trabaja sobre todo la parte alta del pecho.'),
  exercise('Butterfly', 'Butterfly', 'Pec deck fly', 'Pecho',
    'Sentado en la máquina, con la espalda pegada al respaldo y los brazos a la altura del pecho. Juntá los brazos adelante apretando el pecho, sostené un segundo y volvé despacio hasta sentir el estiramiento, sin que los hombros se vayan hacia adelante.'),

  exercise('Wide-Grip_Lat_Pulldown', 'Wide-Grip Lat Pulldown', 'Jalón al pecho en máquina', 'Espalda',
    'Sentado con las piernas trabadas bajo los rodillos, tomá la barra con agarre ancho. Con el pecho alto y una leve inclinación hacia atrás, bajá la barra hasta la parte alta del pecho llevando los codos hacia abajo. Subí controlado hasta estirar los brazos.'),
  exercise('Pullups', 'Pullups', 'Dominadas', 'Espalda',
    'Colgado de la barra con agarre prono, un poco más ancho que los hombros. Subí llevando el pecho hacia la barra hasta que el mentón la pase, sin balancearte, y bajá despacio hasta estirar los brazos.'),
  exercise('Leverage_Iso_Row', 'Leverage Iso Row', 'Remo en máquina', 'Espalda',
    'Sentado con el pecho apoyado en el respaldo, tomá las manijas con los brazos estirados. Tirá llevando los codos hacia atrás y juntando los omóplatos, sostené un segundo y volvé controlado.'),
  exercise('One-Arm_Dumbbell_Row', 'One-Arm Dumbbell Row', 'Remo con mancuerna', 'Espalda',
    'Con una rodilla y una mano apoyadas en el banco y la espalda recta, sostené la mancuerna con el otro brazo estirado. Tirá llevando el codo hacia la cadera, pegado al cuerpo, y bajá despacio. Hacé todas las repeticiones de un lado y después cambiá.'),

  exercise('Side_Lateral_Raise', 'Side Lateral Raise', 'Vuelos laterales', 'Hombros',
    'De pie, con una mancuerna en cada mano a los costados y los codos apenas flexionados. Subí los brazos hacia los lados hasta la altura de los hombros, sin impulso, y bajá lento.'),
  exercise('Front_Dumbbell_Raise', 'Front Dumbbell Raise', 'Vuelos frontales', 'Hombros',
    'De pie, con las mancuernas delante de los muslos. Subí los brazos estirados hacia adelante hasta la altura de los hombros, sin balancear el cuerpo, y bajá controlado.'),
  exercise('Standing_Military_Press', 'Standing Military Press', 'Press militar', 'Hombros',
    'De pie, con la barra apoyada a la altura de los hombros y las manos un poco más abiertas que ellos. Apretá abdomen y glúteos y empujá la barra hasta arriba de la cabeza sin arquear la espalda. Bajá controlado hasta el pecho.'),

  exercise('Hammer_Curls', 'Hammer Curls', 'Bíceps martillo con mancuerna', 'Bíceps',
    'De pie, con una mancuerna en cada mano y las palmas mirándose. Flexioná los codos subiendo las mancuernas sin girar las muñecas y sin mover los codos de los costados. Bajá despacio.'),
  exercise('Dumbbell_Bicep_Curl', 'Dumbbell Bicep Curl', 'Bíceps con mancuerna', 'Bíceps',
    'De pie, con las mancuernas a los costados y las palmas hacia adelante. Subí flexionando los codos, que quedan quietos pegados al cuerpo, apretá arriba y bajá controlado sin balancearte.'),
  exercise('Incline_Dumbbell_Curl', 'Incline Dumbbell Curl', 'Bíceps sentado en banco inclinado con mancuerna', 'Bíceps',
    'Sentado en un banco inclinado a unos 45°, con los brazos colgando y las palmas hacia adelante. Subí las mancuernas sin despegar la espalda ni adelantar los codos, y bajá hasta estirar del todo los brazos.'),

  exercise('Standing_Dumbbell_Triceps_Extension', 'Standing Dumbbell Triceps Extension', 'Transnuca con mancuerna', 'Tríceps',
    'De pie o sentado, sostené una mancuerna con las dos manos por encima de la cabeza. Bajala por detrás de la nuca flexionando solo los codos, que apuntan hacia arriba, y estirá los brazos para volver.'),
  exercise('Dips_-_Triceps_Version', 'Dips - Triceps Version', 'Fondos', 'Tríceps',
    'En las paralelas, con los brazos estirados y el torso derecho. Bajá flexionando los codos hacia atrás hasta formar unos 90° y empujá hasta estirar los brazos. Si cuesta, empezá con fondos asistidos o en banco.'),

  exercise('Leg_Press', 'Leg Press', 'Prensa', 'Piernas',
    'Sentado en la prensa con la espalda apoyada y los pies en la plataforma, a la altura de los hombros. Destrabá y bajá doblando las rodillas hasta unos 90° sin despegar la cola del asiento. Empujá sin trabar las rodillas al final.'),
  exercise('Dumbbell_Squat', 'Dumbbell Squat', 'Squat con mancuernas', 'Piernas',
    'De pie, con una mancuerna en cada mano a los costados y los pies a la altura de los hombros. Bajá llevando la cadera hacia atrás, con el pecho alto y las rodillas en la línea de los pies, hasta que los muslos queden paralelos al piso. Subí empujando con los talones.'),
  exercise('Seated_Leg_Curl', 'Seated Leg Curl', 'Sillón femoral', 'Piernas',
    'Sentado en la máquina, con el rodillo apoyado detrás de los tobillos y el de arriba sobre los muslos. Flexioná las rodillas llevando los talones hacia abajo y atrás, sostené un segundo y volvé despacio.'),
  exercise('Leg_Extensions', 'Leg Extensions', 'Sillón cuádriceps', 'Piernas',
    'Sentado en la máquina, con la espalda apoyada y el rodillo sobre los tobillos. Estirá las piernas hasta quedar rectas, apretá el cuádriceps arriba y bajá controlado.'),
  exercise('Standing_Dumbbell_Calf_Raise', 'Standing Dumbbell Calf Raise', 'Gemelos con mancuerna', 'Piernas',
    'De pie, con una mancuerna en cada mano y la punta de los pies sobre un escalón. Subí en puntas de pie lo más alto que puedas, sostené un segundo y bajá los talones por debajo del escalón para estirar.'),
  exercise('Dumbbell_Lunges', 'Dumbbell Lunges', 'Estocadas con mancuernas', 'Piernas',
    'De pie, con una mancuerna en cada mano a los costados. Dá un paso largo hacia adelante y bajá hasta que las dos rodillas queden a unos 90°, con la de atrás cerca del piso y la de adelante sin pasar la punta del pie. Empujá con el talón de adelante para volver y alterná las piernas.'),
  exercise('Split_Squat_with_Dumbbells', 'Split Squat with Dumbbells', 'Sentadilla búlgara', 'Piernas',
    'Con el empeine de atrás apoyado en un banco y una mancuerna en cada mano, bajá en línea recta hasta que el muslo de adelante quede paralelo al piso. Mantené el torso derecho y subí empujando con el talón de adelante. Hacé todas las repeticiones de un lado y cambiá.'),
  exercise('Barbell_Deadlift', 'Barbell Deadlift', 'Peso muerto', 'Piernas',
    'Con la barra sobre el medio de los pies, bajá flexionando cadera y rodillas y tomala por fuera de las piernas. Con la espalda recta y el pecho alto, subí empujando el piso con los pies y llevando la cadera adelante, con la barra pegada al cuerpo. Bajá por el mismo camino.'),
  exercise('Romanian_Deadlift', 'Romanian Deadlift', 'Peso muerto rumano', 'Piernas',
    'De pie con la barra a la altura de los muslos y las rodillas apenas flexionadas. Llevá la cadera hacia atrás bajando la barra pegada a las piernas, con la espalda recta, hasta sentir el estiramiento detrás de los muslos. Volvé apretando los glúteos.'),
  exercise('Barbell_Hip_Thrust', 'Barbell Hip Thrust', 'Hip thrust', 'Piernas',
    'Con la parte alta de la espalda apoyada en un banco, los pies firmes en el piso y la barra sobre la cadera. Empujá la cadera hacia arriba hasta que el torso quede alineado con los muslos, apretá los glúteos un segundo y bajá controlado.'),
  exercise('Bent_Over_Barbell_Row', 'Bent Over Barbell Row', 'Remo con barra', 'Espalda',
    'De pie, con las rodillas un poco flexionadas, inclinate hacia adelante con la espalda recta hasta casi quedar paralelo al piso. Tirá la barra hacia la parte baja del pecho llevando los codos atrás y juntando los omóplatos. Bajá controlado.'),
  exercise('Triceps_Pushdown', 'Triceps Pushdown', 'Tríceps en polea', 'Tríceps',
    'De pie frente a la polea alta, tomá la barra con los codos pegados a los costados. Empujá hacia abajo hasta estirar los brazos moviendo solo los antebrazos, y volvé despacio hasta que queden a 90°.'),
  exercise('Plank', 'Plank', 'Plancha', 'Abdomen',
    'Apoyado sobre los antebrazos y las puntas de los pies, con los codos debajo de los hombros. Mantené el cuerpo en línea recta de la cabeza a los talones, apretando abdomen y glúteos, sin dejar caer la cadera. Las repeticiones son segundos sostenidos.'),
  exercise('Cable_Crunch', 'Cable Crunch', 'Abdominales en polea', 'Abdomen',
    'De rodillas frente a la polea alta, sostené la soga a los costados de la cabeza. Flexioná el tronco llevando los codos hacia los muslos, contrayendo el abdomen sin mover la cadera, y volvé despacio.'),
  exercise('Farmers_Walk', 'Farmers Walk', 'Farmer walk', 'Cardio y funcional',
    'Tomá una mancuerna o pesa pesada en cada mano y caminá con pasos cortos y firmes, con el pecho alto, los hombros atrás y el abdomen apretado. Las repeticiones son metros o segundos de caminata.'),
  exercise('Bicycling_Stationary', 'Bicycling, Stationary', 'Bicicleta', 'Cardio y funcional',
    'Ajustá el asiento para que la rodilla quede apenas flexionada con el pedal abajo. Pedaleá a ritmo constante con la espalda recta. Sirve para entrar en calor o como cardio; las repeticiones son minutos.'),
];

const byId = new Map(EXERCISES.map((e) => [e.id, e]));
const OTHER_NAMES: Record<string, string[]> = {
  'Barbell_Bench_Press_-_Medium_Grip': ['Press banca', 'Press de banca', 'Press plano', 'Press de pecho'],
  Dumbbell_Bench_Press: ['Press con mancuernas', 'Press plano con mancuernas'],
  Incline_Dumbbell_Press: ['Press inclinado', 'Press inclinado con mancuernas'],
  Butterfly: ['Pec deck', 'Peck deck', 'Aperturas en máquina'],
  'Wide-Grip_Lat_Pulldown': ['Jalón al pecho', 'Jalón', 'Polea al pecho'],
  Pullups: ['Dominada'],
  Leverage_Iso_Row: ['Remo en polea', 'Remo sentado'],
  'One-Arm_Dumbbell_Row': ['Remo unilateral'],
  Side_Lateral_Raise: ['Elevaciones laterales'],
  Front_Dumbbell_Raise: ['Elevaciones frontales'],
  Standing_Military_Press: ['Press de hombros'],
  Hammer_Curls: ['Martillo', 'Curl martillo'],
  Dumbbell_Bicep_Curl: ['Curl de bíceps', 'Curl con mancuernas', 'Bíceps'],
  Incline_Dumbbell_Curl: ['Curl inclinado'],
  Standing_Dumbbell_Triceps_Extension: ['Transnuca', 'Tríceps transnuca', 'Extensión de tríceps'],
  'Dips_-_Triceps_Version': ['Fondos en paralelas'],
  Leg_Press: ['Prensa de piernas', 'Prensa 45'],
  Dumbbell_Squat: ['Sentadilla', 'Sentadilla con mancuernas', 'Sentadilla goblet', 'Squat'],
  Seated_Leg_Curl: ['Camilla femoral', 'Curl femoral', 'Femoral'],
  Leg_Extensions: ['Extensión de cuádriceps', 'Sillón de cuádriceps', 'Cuádriceps'],
  Standing_Dumbbell_Calf_Raise: ['Gemelos', 'Pantorrillas'],
  Dumbbell_Lunges: ['Estocadas', 'Estocada', 'Zancadas', 'Lunges'],
  Split_Squat_with_Dumbbells: ['Búlgaras', 'Búlgara', 'Sentadilla búlgara', 'Bulgarian split squat'],
  Barbell_Deadlift: ['Peso muerto convencional', 'Deadlift'],
  Romanian_Deadlift: ['Peso muerto rumano', 'RDL'],
  Barbell_Hip_Thrust: ['Hip thrust con barra', 'Empuje de cadera'],
  Bent_Over_Barbell_Row: ['Remo con barra', 'Remo inclinado con barra'],
  Triceps_Pushdown: ['Tríceps en polea', 'Extensión de tríceps en polea', 'Pushdown'],
  Plank: ['Plancha', 'Plancha abdominal'],
  Cable_Crunch: ['Abdominales en polea', 'Crunch en polea'],
  Farmers_Walk: ['Farmer walk', 'Caminata del granjero'],
  Bicycling_Stationary: ['Bicicleta', 'Bici fija', 'Spinning'],
};
for (const e of EXERCISES) e.otherNames = OTHER_NAMES[e.id];

/** Lowercase, no accents or punctuation: "Jalón al pecho." and "jalon al pecho" match. */
const normalize = (name: string) =>
  name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const byName = new Map(
  EXERCISES.flatMap((e) => [e.name, e.alias, ...(e.otherNames ?? [])].map((n) => [normalize(n), e] as const)),
);

export const getExercise = (id: string) => byId.get(id);

/** The catalog exercise behind a planned one: by `exerciseId`, or by name for exercises typed by hand. */
export const exerciseFor = (planned: Pick<PlannedExercise, 'name' | 'exerciseId'>) =>
  (planned.exerciseId && byId.get(planned.exerciseId)) || byName.get(normalize(planned.name));

/** Identifies the same exercise across routines: the catalog id when known, otherwise the normalized name. */
export const exerciseKey = (planned: Pick<PlannedExercise, 'name' | 'exerciseId'>) =>
  exerciseFor(planned)?.id ?? normalize(planned.name);
