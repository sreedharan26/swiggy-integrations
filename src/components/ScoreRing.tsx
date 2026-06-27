export function ScoreRing({
  score,
  band,
  size = 150,
}: {
  score: number;
  band: string;
  size?: number;
}) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#1BA672" : score >= 60 ? "#1BA672" : "#FC8019";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EDEDEA"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold leading-none">
          {score}
          <span className="text-base text-ink-muted">/100</span>
        </span>
        <span className="mt-1 text-sm font-semibold text-leaf-600">{band}</span>
      </div>
    </div>
  );
}
