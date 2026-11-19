import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { AddRoutine } from './pages/coach/AddRoutine';
import { AssignTemplate } from './pages/coach/AssignTemplate';
import { CoachHome } from './pages/coach/CoachHome';
import { ImportCsv } from './pages/coach/ImportCsv';
import { RoutineEditor } from './pages/coach/RoutineEditor';
import { StudentForm } from './pages/coach/StudentForm';
import { StudentPlan } from './pages/coach/StudentPlan';
import { TemplateEditor } from './pages/coach/TemplateEditor';
import { Templates } from './pages/coach/Templates';
import { RoutineSession } from './pages/student/RoutineSession';
import { StudentDay } from './pages/student/StudentDay';
import { RequireRole, SessionProvider } from './session';

export function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Login />} />
            <Route path="coach" element={<RequireRole role="coach"><CoachHome /></RequireRole>} />
            <Route path="coach/importar" element={<RequireRole role="coach"><ImportCsv /></RequireRole>} />
            <Route path="coach/alumnos/nuevo" element={<RequireRole role="coach"><StudentForm /></RequireRole>} />
            <Route path="coach/alumno/:studentId/editar" element={<RequireRole role="coach"><StudentForm /></RequireRole>} />
            <Route path="coach/alumno/:studentId" element={<RequireRole role="coach"><StudentPlan /></RequireRole>} />
            <Route path="coach/alumno/:studentId/rutina/agregar" element={<RequireRole role="coach"><AddRoutine /></RequireRole>} />
            <Route path="coach/alumno/:studentId/rutina/nueva" element={<RequireRole role="coach"><RoutineEditor /></RequireRole>} />
            <Route path="coach/rutina/:routineId" element={<RequireRole role="coach"><RoutineEditor /></RequireRole>} />
            <Route path="coach/plantillas" element={<RequireRole role="coach"><Templates /></RequireRole>} />
            <Route path="coach/plantillas/nueva" element={<RequireRole role="coach"><TemplateEditor /></RequireRole>} />
            <Route path="coach/plantillas/:templateId" element={<RequireRole role="coach"><TemplateEditor /></RequireRole>} />
            <Route path="coach/plantillas/:templateId/asignar" element={<RequireRole role="coach"><AssignTemplate /></RequireRole>} />
            <Route path="alumno" element={<RequireRole role="student"><StudentDay /></RequireRole>} />
            <Route path="alumno/entrenar" element={<RequireRole role="student"><RoutineSession key="due" /></RequireRole>} />
            <Route path="alumno/sesion/:sessionId" element={<RequireRole role="student"><RoutineSession /></RequireRole>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}
