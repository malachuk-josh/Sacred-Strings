import type { ChordShape } from "@/lib/chords";

// Fretboard geometry: 6 strings, a 3-fret window.
const STRING_X = [20, 40, 60, 80, 100, 120];
const FRET_Y = [62, 98, 134]; // fret lines
const FRET_CENTER = [47, 80, 116]; // center of window rows 1, 2, 3
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
  const baseFret = chord.baseFret ?? 1;
  const showNut = baseFret === 1;
  // Convert an absolute fret to a window row (1..3); returns null if outside.
  const row = (absFret: number) => {
    const r = absFret - baseFret + 1;
    return r >= 1 && r <= 3 ? r : null;
  };

  return (
    <svg width={width} height={height} viewBox="0 0 140 170" fill="none" className={className}>
      {/* nut or base-fret label */}
      {showNut ? (
        <rect x="20" y="26" width="100" height="6" rx="1" fill="#E8C78E" />
      ) : (
        <>
          <line x1="20" y1={NUT_Y} x2="120" y2={NUT_Y} stroke="#8B6F52" strokeWidth="1.5" />
          <text x="10" y={FRET_CENTER[0] + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#8B7355">{baseFret}fr</text>
        </>
      )}
      {/* frets */}
      {FRET_Y.map((y) => (
        <line key={y} x1="20" y1={y} x2="120" y2={y} stroke="#8B6F52" strokeWidth="1.5" />
      ))}
      {/* strings */}
      {STRING_X.map((x) => (
        <line key={x} x1={x} y1={NUT_Y} x2={x} y2="134" stroke="#C9B49A" strokeWidth="1.2" />
      ))}
      {/* open string marks (only meaningful at the nut) */}
      {showNut && chord.open.map((s) => (
        <circle key={`o${s}`} cx={STRING_X[s]} cy="16" r="4" stroke="#C9B49A" strokeWidth="1.5" fill="none" />
      ))}
      {/* muted string marks */}
      {(chord.muted ?? []).map((s) => (
        <g key={`m${s}`} stroke="#C9B49A" strokeWidth="1.5" strokeLinecap="round">
          <line x1={STRING_X[s] - 4} y1="12" x2={STRING_X[s] + 4} y2="20" />
          <line x1={STRING_X[s] + 4} y1="12" x2={STRING_X[s] - 4} y2="20" />
        </g>
      ))}
      {/* barre */}
      {chord.barre && row(chord.barre.fret) !== null && (
        <rect
          x={STRING_X[chord.barre.from] - 7}
          y={FRET_CENTER[row(chord.barre.fret)! - 1] - 7}
          width={STRING_X[chord.barre.to] - STRING_X[chord.barre.from] + 14}
          height={14}
          rx={7}
          fill="#D4A96A"
        />
      )}
      {/* finger dots */}
      {chord.dots.map((d, i) => {
        const r = row(d.fret);
        if (r === null) return null;
        return (
          <g key={i}>
            <circle cx={STRING_X[d.s]} cy={FRET_CENTER[r - 1]} r="9" fill="#D4A96A" />
            <text x={STRING_X[d.s]} y={FRET_CENTER[r - 1] + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#2C1810">{d.finger}</text>
          </g>
        );
      })}
    </svg>
  );
}
