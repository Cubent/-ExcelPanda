type Point = { score: number; takenAt: string };

const W = 480;
const H = 160;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };

/** A small dependency-free line chart of logged scores against the passing standard. */
export const TrendChart = ({ points, passing }: { points: Point[]; passing: number }) => {
  if (points.length < 2) return null;

  const sorted = [...points].sort((a, b) => Date.parse(a.takenAt) - Date.parse(b.takenAt));
  const times = sorted.map((p) => Date.parse(p.takenAt));
  const minT = times[0];
  const maxT = times[times.length - 1];
  const spanT = Math.max(1, maxT - minT);

  const lo = Math.min(passing, ...sorted.map((p) => p.score)) - 8;
  const hi = Math.max(passing, ...sorted.map((p) => p.score)) + 8;

  const x = (t: number) => PAD.left + ((t - minT) / spanT) * (W - PAD.left - PAD.right);
  const y = (s: number) => PAD.top + (1 - (s - lo) / (hi - lo)) * (H - PAD.top - PAD.bottom);

  const path = sorted.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(Date.parse(p.takenAt)).toFixed(1)},${y(p.score).toFixed(1)}`).join(' ');
  const summary = sorted.map((p) => `${p.score} on ${new Date(p.takenAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`).join(', ');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Practice exam scores over time: ${summary}. Passing standard is ${passing}.`}
      className="mt-4 h-auto w-full"
    >
      <line x1={PAD.left} x2={W - PAD.right} y1={y(passing)} y2={y(passing)} stroke="#C46B10" strokeDasharray="4 4" strokeWidth="1" />
      <text x={PAD.left - 6} y={y(passing) + 3} textAnchor="end" className="fill-[#C46B10] text-[12px]">
        {passing}
      </text>
      <text x={W - PAD.right} y={y(passing) - 5} textAnchor="end" className="fill-[#C46B10] text-[12px]">
        passing
      </text>
      <path d={path} fill="none" stroke="#06005A" strokeWidth="2" strokeLinejoin="round" className="dark:stroke-white" />
      {sorted.map((p) => (
        <text
          key={`d-${p.takenAt}`}
          x={x(Date.parse(p.takenAt))}
          y={H - 6}
          textAnchor={x(Date.parse(p.takenAt)) < PAD.left + 24 ? 'start' : x(Date.parse(p.takenAt)) > W - PAD.right - 24 ? 'end' : 'middle'}
          className="fill-gray-400 text-[12px] dark:fill-gray-500"
        >
          {new Date(p.takenAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
        </text>
      ))}
      {sorted.map((p) => (
        <g key={`${p.takenAt}-${p.score}`}>
          <circle cx={x(Date.parse(p.takenAt))} cy={y(p.score)} r="4" className="fill-[#06005A] dark:fill-white" />
          <text x={x(Date.parse(p.takenAt))} y={y(p.score) - 9} textAnchor="middle" className="fill-gray-600 text-[12px] dark:fill-gray-300">
            {p.score}
          </text>
        </g>
      ))}
    </svg>
  );
};
