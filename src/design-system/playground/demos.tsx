import { useState, type ReactNode } from 'react';
import { Button, WeekCalendar } from '..';

export interface Demo {
  id: string;
  name: string;
  render: () => ReactNode;
}

function daysFromToday(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function SelectableCalendar() {
  const [selected, setSelected] = useState(daysFromToday(0));
  return (
    <>
      <WeekCalendar
        trainedDates={[daysFromToday(-2), daysFromToday(-9), daysFromToday(-11)]}
        plannedDates={[daysFromToday(0), daysFromToday(2)]}
        selectedDate={selected}
        onSelectDate={setSelected}
      />
      <p className="pg-note">Día elegido: {selected}</p>
    </>
  );
}

export const demos: Demo[] = [
  {
    id: 'week-calendar',
    name: 'WeekCalendar',
    render: () => (
      <>
        <h3 className="pg-subtitle">Solo lectura</h3>
        <WeekCalendar
          trainedDates={[daysFromToday(-2), daysFromToday(-8), daysFromToday(-10)]}
          plannedDates={[daysFromToday(0), daysFromToday(2)]}
          footer="Te quedan 2 de 3 esta semana"
        />
        <h3 className="pg-subtitle">Con días seleccionables</h3>
        <SelectableCalendar />
      </>
    ),
  },
  {
    id: 'button',
    name: 'Button',
    render: () => (
      <>
        <div className="pg-row">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div className="pg-row">
          <Button disabled>Disabled</Button>
        </div>
        <Button block>Block</Button>
      </>
    ),
  },
];
