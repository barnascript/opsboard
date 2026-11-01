export interface BarDatum {
  label: string;
  value: number;
}

/**
 * Dependency-free SVG bar chart. Screen readers get a real table instead of
 * the drawing, so the numbers are never locked inside pixels.
 */
export function BarChart({ data, title, format = String }: { data: BarDatum[]; title: string; format?: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 600;
  const h = 160;
  const gap = 2;
  const bw = data.length ? w / data.length - gap : 0;
  return (
    <figure className="ob-chart">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-hidden="true" focusable="false" preserveAspectRatio="none">
        {data.map((d, i) => {
          const bh = (d.value / max) * (h - 4);
          return (
            <rect key={d.label} x={i * (bw + gap)} y={h - bh} width={bw} height={bh} rx={2} className="ob-chart__bar">
              <title>{`${d.label}: ${format(d.value)}`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption className="ob-visually-hidden">
        <table>
          <caption>{title}</caption>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <th scope="row">{d.label}</th>
                <td>{format(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
