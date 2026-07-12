import type { ChordShape } from "@/lib/curriculum";

// Fretboard geometry (matches the design handoff): 6 strings, 3 frets.
const STRING_X = [20, 40, 60, 80, 100, 120];
const FRET_Y = [62, 98, 134]; // fret lines
const FRET_CENTER = [47, 80, 116]; // center of fret 1, 2, 3
const NUT_Y = 32;

export default function ChordDiagram({
  chord,
  width = 140,
  className = "",
}: {
  chord: ChordShape;
  width?: number;
  className?: string;
}) {
  const height = (width / 140) * 170;
  return (
    <svg width={width} height={height} viewBox="0 0 140 170" fill="none" className={className}>
      {/* nut */}
      <rect x="20" y="26" width="100" height="6" rx="1" fill="#E8C78E" />
      {/* frets */}
      {FRET_Y.map((y) => (
        <line key={y} x1="20" y1={y} x2="120" y2={y} stroke="#8B6F52" strokeWidth="1.5" />
      ))}
      {/* strings */}
      {STRING_X.map((x) => (
        <line key={x} x1={x} y1="32" x2={x} y2="134" stroke="#C9B49A" strokeWidth="1.2" />
      ))}
      {/* open string marks */}
      {chord.open.map((s) => (
        <circle key={`o${s}`} cx={STRING_X[s]} cy="16" r="4" stroke="#C9B49A" strokeWidth="1.5" fill="none" />
      ))}
      {/* muted string marks */}
      {(chord.muted ?? []).map((s) => (
        <g key={`m${s}`} stroke="#C9B49A" strokeWidth="1.5" strokeLinecap="round">
          <line x1={STRING_X[s] - 4} y1="12" x2={STRING_X[s] + 4} y2="20" />
          <line x1={STRING_X[s] + 4} y1="12" x2={STRING_X[s] - 4} y2="20" />
        </g>
      ))}
      {/* finger dots */}
      {chord.dots.map((d, i) => (
        <g key={i}>
          <circle cx={STRING_X[d.s]} cy={FRET_CENTER[d.fret - 1]} r="9" fill="#D4A96A" />
          <text
            x={STRING_X[d.s]}
            y={FRET_CENTER[d.fret - 1] + 4}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="#2C1810"
          >
            {d.finger}
          </text>
        </g>
      ))}
    </svg>
  );
}
