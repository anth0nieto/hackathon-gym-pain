import type { ReactNode } from 'react';
import { Button } from '..';

export interface Demo {
  id: string;
  name: string;
  render: () => ReactNode;
}

export const demos: Demo[] = [
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
