type RangeBarProps = {
  low: number;
  high: number;
  center: number;
  passing: number;
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * The estimated range drawn against the passing standard, for the navy hero
 * card. Follows the dashboard's status rule: green when the whole range clears
 * the bar, brand orange when any of it falls below.
 */
export const RangeBar = ({ low, high, center, passing }: RangeBarProps) => {
  // Round the axis out to the nearest 5 with some breathing room either side.
  const min = clamp(Math.floor((Math.min(low, passing) - 12) / 5) * 5, 0, 300);
  const max = clamp(Math.ceil((Math.max(high, passing) + 12) / 5) * 5, 0, 300);
  const span = Math.max(1, max - min);
  const pos = (score: number) => ((clamp(score, min, max) - min) / span) * 100;

  const clears = low >= passing;
  const bandLeft = pos(low);
  const bandWidth = Math.max(1.5, pos(high) - pos(low));

  return (
    <div
      role="img"
      aria-label={`Estimated range ${low} to ${high}, centered on ${center}, against a passing standard of ${passing}`}
      className="mt-6"
    >
      <div className="relative h-2.5 rounded-full bg-white/15">
        <div
          className={`absolute inset-y-0 rounded-full ${clears ? 'bg-green-400' : 'bg-[#C46B10]'}`}
          style={{ left: `${bandLeft}%`, width: `${bandWidth}%` }}
        />
        <div
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#000C3F] bg-white"
          style={{ left: `${pos(center)}%` }}
        />
        <div className="absolute -top-1.5 -bottom-1.5 w-px bg-white/80" style={{ left: `${pos(passing)}%` }} />
      </div>

      <div className="relative mt-3 h-4 text-[11px] text-white/50">
        <span className="absolute left-0">{min}</span>
        <span className="absolute right-0">{max}</span>
        <span
          className="absolute -translate-x-1/2 whitespace-nowrap font-semibold text-white/80"
          style={{ left: `${clamp(pos(passing), 8, 92)}%` }}
        >
          passing {passing}
        </span>
      </div>
    </div>
  );
};
