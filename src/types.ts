export type Role = 'admin' | 'coach' | 'student';

export interface Gym {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  coachId?: string;
  dni?: string;
  /** Students only: WhatsApp number, international format, digits only. */
  phone?: string | null;
  /** Students only: how many days a week they train, which is how many routines they should have. */
  daysPerWeek?: number;
  /** Students only: the gym they train at. */
  gymId?: string;
  /** Coaches only: the gyms the admin assigned them. */
  gymIds?: string[];
  /** Coaches only: login created by the admin. */
  username?: string;
  password?: string;
}

export interface Prescription {
  sets: number;
  reps: number;
  weight: number;
}

export interface PlannedExercise extends Prescription {
  id: string;
  name: string;
  /** Catalog exercise (src/data/exercises.ts), for its photos and how-to. */
  exerciseId?: string;
}

/** Reusable routine in the coach's library (e.g. "Principiante", "Avanzado"). */
export interface RoutineTemplate {
  id: string;
  coachId: string;
  name: string;
  exercises: PlannedExercise[];
}

/**
 * One of the student's N routines, one per weekly gym day. The student does them in
 * `position` order (1, 2, 3, then 1 again), whatever day they train.
 */
export interface Routine {
  id: string;
  coachId: string;
  studentId: string;
  position: number;
  name: string;
  exercises: PlannedExercise[];
  /** Exercises for the next time only, set by the coach. Cleared when that session starts. */
  override?: PlannedExercise[] | null;
  templateId?: string;
}

/**
 * One time the student trained a routine. `position`, `routineName` and `exercises` are copied at start,
 * so history survives the coach editing or deleting the routine.
 */
export interface Session {
  id: string;
  studentId: string;
  routineId: string;
  position: number;
  routineName: string;
  /** What was planned that day: the routine's exercises, or its override. */
  exercises: PlannedExercise[];
  startedAt: string;
  finishedAt?: string | null;
}

export type ExerciseStatus = 'done' | 'skipped';

/** One set as the student did it. */
export interface SetDetail {
  reps: number;
  weight: number;
}

/**
 * `sets`, `reps` and `weight` summarize the exercise: how many sets, and the reps and weight of the last one.
 * `setDetails` has every set, for when they differ.
 */
export interface ExerciseLog extends Prescription {
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  status: ExerciseStatus;
  setDetails?: SetDetail[] | null;
  updatedAt: string;
}

/** `done` once the student taps Finalizar, or on its own 6 hours after it started. */
export type SessionStatus = 'open' | 'done';
