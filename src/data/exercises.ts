import type { PlannedExercise } from '../types';

export type Muscle = 'Pecho' | 'Espalda' | 'Hombros' | 'Bíceps' | 'Tríceps' | 'Piernas';

export const MUSCLES: Muscle[] = ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Piernas'];

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
];

const byId = new Map(EXERCISES.map((e) => [e.id, e]));
const byName = new Map(EXERCISES.flatMap((e) => [[e.name.toLowerCase(), e], [e.alias.toLowerCase(), e]]));

export const getExercise = (id: string) => byId.get(id);

/** The catalog exercise behind a planned one: by `exerciseId`, or by name for exercises typed by hand. */
export const exerciseFor = (planned: Pick<PlannedExercise, 'name' | 'exerciseId'>) =>
  (planned.exerciseId && byId.get(planned.exerciseId)) || byName.get(planned.name.trim().toLowerCase());
