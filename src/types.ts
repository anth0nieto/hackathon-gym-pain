export type Role = 'coach' | 'student';

export interface User {
  id: string;
  name: string;
  role: Role;
  coachId?: string;
}

export interface Prescription {
  sets: number;
  reps: number;
  weight: number;
}

export interface PlannedExercise extends Prescription {
  id: string;
  name: string;
}

/** Reusable routine in the coach's library (e.g. "Principiante", "Avanzado"). */
export interface RoutineTemplate {
  id: string;
  coachId: string;
  name: string;
  exercises: PlannedExercise[];
}

/** A routine assigned to one student on one date. Copied from a template, so editing it doesn't touch the template. */
export interface Routine {
  id: string;
  coachId: string;
  studentId: string;
  date: string;
  name: string;
  exercises: PlannedExercise[];
  templateId?: string;
}

export type ExerciseStatus = 'done' | 'skipped';

export interface ExerciseLog extends Prescription {
  routineId: string;
  exerciseId: string;
  status: ExerciseStatus;
  updatedAt: string;
}

export type RoutineStatus = 'pending' | 'partial' | 'complete' | 'skipped';
