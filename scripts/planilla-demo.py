"""Builds public/planilla-coach-demo.csv: a coach's long-running Google Sheet with 24 students, exported as CSV.

Run: python3 scripts/planilla-demo.py > public/planilla-coach-demo.csv
"""
import csv, random, sys

random.seed(2026)
TAKEN = {'30111222', '35333444', '40555666', '41399264', '39967191', '96220982', '91000000'}

STUDENTS = [  # name, days a week, level
    ('Valentina Ríos', 3, 'intermedio'), ('Martín Aguirre', 4, 'avanzado'), ('Lucía Benítez', 2, 'principiante'),
    ('Santiago Ferreyra', 5, 'avanzado'), ('Camila Ortega', 3, 'principiante'), ('Joaquín Paz', 3, 'intermedio'),
    ('Florencia Medina', 2, 'intermedio'), ('Tomás Quiroga', 4, 'intermedio'), ('Agustina Luna', 3, 'avanzado'),
    ('Nicolás Herrera', 2, 'principiante'), ('Sofía Carrizo', 4, 'intermedio'), ('Mateo Domínguez', 5, 'intermedio'),
    ('Julieta Vega', 3, 'principiante'), ('Franco Molina', 3, 'avanzado'), ('Micaela Rojas', 2, 'intermedio'),
    ('Ignacio Suárez', 4, 'avanzado'), ('Rocío Navarro', 3, 'intermedio'), ('Federico Castro', 2, 'principiante'),
    ('Paula Giménez', 3, 'intermedio'), ('Gonzalo Romero', 5, 'avanzado'), ('Carolina Sosa', 2, 'principiante'),
    ('Bautista Acosta', 3, 'intermedio'), ('Emilia Torres', 4, 'principiante'), ('Lautaro Ibáñez', 3, 'avanzado'),
]

# The coach's own wording; every name matches the app's exercise list or one of its other names.
# (exercise, base kg for an intermediate student, bodyweight?)
E = {
    'Sentadilla': (30, False), 'Prensa': (120, False), 'Camilla femoral': (35, False), 'Sillón cuádriceps': (40, False),
    'Gemelos': (16, False), 'Press banca': (50, False), 'Press inclinado': (18, False), 'Pec deck': (35, False),
    'Fondos': (0, True), 'Transnuca': (14, False), 'Jalón al pecho': (45, False), 'Remo sentado': (45, False),
    'Remo con mancuerna': (20, False), 'Dominadas': (0, True), 'Curl de bíceps': (12, False), 'Martillo': (12, False),
    'Press militar': (30, False), 'Vuelos laterales': (7, False), 'Vuelos frontales': (7, False),
}

PLANS = {
    2: [('Full body A', ['Sentadilla', 'Press banca', 'Jalón al pecho', 'Vuelos laterales', 'Curl de bíceps']),
        ('Full body B', ['Prensa', 'Press inclinado', 'Remo sentado', 'Press militar', 'Transnuca'])],
    3: [('Piernas', ['Sentadilla', 'Prensa', 'Camilla femoral', 'Sillón cuádriceps', 'Gemelos']),
        ('Empuje', ['Press banca', 'Press inclinado', 'Press militar', 'Vuelos laterales', 'Fondos']),
        ('Tirón', ['Dominadas', 'Jalón al pecho', 'Remo con mancuerna', 'Curl de bíceps', 'Martillo'])],
    4: [('Tren superior A', ['Press banca', 'Jalón al pecho', 'Press militar', 'Curl de bíceps', 'Transnuca']),
        ('Tren inferior A', ['Sentadilla', 'Camilla femoral', 'Sillón cuádriceps', 'Gemelos']),
        ('Tren superior B', ['Press inclinado', 'Remo sentado', 'Vuelos laterales', 'Martillo', 'Fondos']),
        ('Tren inferior B', ['Prensa', 'Camilla femoral', 'Sillón cuádriceps', 'Gemelos'])],
    5: [('Piernas', ['Sentadilla', 'Prensa', 'Camilla femoral', 'Sillón cuádriceps', 'Gemelos']),
        ('Pecho y tríceps', ['Press banca', 'Press inclinado', 'Pec deck', 'Transnuca', 'Fondos']),
        ('Espalda y bíceps', ['Dominadas', 'Jalón al pecho', 'Remo sentado', 'Curl de bíceps', 'Martillo']),
        ('Hombros', ['Press militar', 'Vuelos laterales', 'Vuelos frontales', 'Remo con mancuerna']),
        ('Full body', ['Sentadilla', 'Press banca', 'Jalón al pecho', 'Press militar'])],
}

LEVEL = {'principiante': (0.6, 3, 12), 'intermedio': (1.0, 4, 10), 'avanzado': (1.35, 4, 8)}

def kg(base, factor):
    # Plates go in 2.5 kg steps; vary a little per student, as a real sheet would.
    return max(2.5, round(base * factor * random.uniform(0.9, 1.1) / 2.5) * 2.5)

def dni():
    while True:
        d = str(random.randint(28_000_000, 46_999_999))
        if d not in TAKEN:
            TAKEN.add(d)
            return d

w = csv.writer(sys.stdout, lineterminator='\n')
w.writerow(['alumno', 'dni', 'dias', 'rutina', 'ejercicio', 'series', 'reps', 'peso'])
for name, days, level in STUDENTS:
    factor, sets, reps = LEVEL[level]
    d = dni()
    for routine, exercises in PLANS[days]:
        for ex in exercises:
            base, bodyweight = E[ex]
            r = 15 if ex in ('Gemelos', 'Vuelos laterales', 'Vuelos frontales') else reps
            if bodyweight:
                r = {'principiante': 6, 'intermedio': 8, 'avanzado': 10}[level]
            w.writerow([name, d, days, routine, ex, sets, r, '' if bodyweight else f'{kg(base, factor):g}'])
