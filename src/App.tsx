import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CoachLayout } from './components/CoachLayout';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { AddRoutine } from './pages/coach/AddRoutine';
import { AssignTemplate } from './pages/coach/AssignTemplate';
import { CoachHome } from './pages/coach/CoachHome';
import { GymQr } from './pages/coach/GymQr';
import { ImportCsv } from './pages/coach/ImportCsv';
import { OneOffEditor } from './pages/coach/OneOffEditor';
import { RoutineEditor } from './pages/coach/RoutineEditor';
import { StudentForm } from './pages/coach/StudentForm';
import { StudentPlan } from './pages/coach/StudentPlan';
import { TemplateEditor } from './pages/coach/TemplateEditor';
import { Templates } from './pages/coach/Templates';
import { RoutineSession } from './pages/student/RoutineSession';
import { Stats } from './pages/student/Stats';
import { StudentDay } from './pages/student/StudentDay';
import { RequireRole, SessionProvider } from './session';

export function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <Routes>
          <Route path="coach" element={<RequireRole role="coach"><CoachLayout /></RequireRole>}>
            <Route index element={<CoachHome />} />
            <Route path="qr" element={<GymQr />} />
            <Route path="importar" element={<ImportCsv />} />
            <Route path="alumnos/nuevo" element={<StudentForm />} />
            <Route path="alumno/:studentId/editar" element={<StudentForm />} />
            <Route path="alumno/:studentId" element={<StudentPlan />} />
            <Route path="alumno/:studentId/rutina/agregar" element={<AddRoutine />} />
            <Route path="alumno/:studentId/rutina/nueva" element={<RoutineEditor />} />
            <Route path="rutina/:routineId/proxima" element={<OneOffEditor />} />
            <Route path="rutina/:routineId" element={<RoutineEditor />} />
            <Route path="plantillas" element={<Templates />} />
            <Route path="plantillas/nueva" element={<TemplateEditor />} />
            <Route path="plantillas/:templateId" element={<TemplateEditor />} />
            <Route path="plantillas/:templateId/asignar" element={<AssignTemplate />} />
          </Route>
          <Route element={<Layout />}>
            <Route index element={<Login />} />
            <Route path="alumno" element={<RequireRole role="student"><StudentDay /></RequireRole>} />
            <Route path="alumno/entrenar" element={<RequireRole role="student"><RoutineSession key="due" /></RequireRole>} />
            <Route path="alumno/stats" element={<RequireRole role="student"><Stats /></RequireRole>} />
            <Route path="alumno/sesion/:sessionId" element={<RequireRole role="student"><RoutineSession /></RequireRole>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}
