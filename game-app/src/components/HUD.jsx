import { Flame, Star } from 'lucide-react';

export default function HUD({ score, streak, popKey }) {
  return (
    <div className="hud">
      <div key={`score-${popKey}`} className="score-box animate-pop">
        <Star size={20} strokeWidth={2.5} />
        <span style={{ marginLeft: '6px' }}>{score}</span>
      </div>
      <div key={`streak-${popKey}`} className="streak-badge animate-pop">
        <Flame size={20} strokeWidth={2.5} />
        <span>{streak}</span>
      </div>
    </div>
  );
}
