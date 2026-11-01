import type { ReactNode } from "react";

export function Card({ title, index, actions, children }: { title: string; index?: string; actions?: ReactNode; children: ReactNode }) {
  const id = `card-${title.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section className="ob-card" aria-labelledby={id}>
      <header className="ob-card__head">
        <div className="ob-card__title">
          {index && <span className="ob-card__index" aria-hidden="true">{index}</span>}
          <h2 id={id}>{title}</h2>
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}
