import type { ReactNode } from "react";

export function Card({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  const id = `card-${title.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section className="ob-card" aria-labelledby={id}>
      <header className="ob-card__head">
        <h2 id={id}>{title}</h2>
        {actions}
      </header>
      {children}
    </section>
  );
}
