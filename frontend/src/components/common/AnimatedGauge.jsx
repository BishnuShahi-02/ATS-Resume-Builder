import { useEffect, useRef, useState } from 'react';

export default function AnimatedGauge({ score = 0, size = 200 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const prevScore = useRef(0);

  useEffect(() => {
    const start = prevScore.current;
    const end = score;
    const duration = 1500;
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setAnimatedScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
    prevScore.current = end;
  }, [score]);

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getScoreClass = () => {
    if (animatedScore >= 70) return 'score-high';
    if (animatedScore >= 40) return 'score-mid';
    return 'score-low';
  };

  const getStrokeColor = () => {
    if (animatedScore >= 70) return 'url(#gradient-high)';
    if (animatedScore >= 40) return 'url(#gradient-mid)';
    return 'url(#gradient-low)';
  };

  return (
    <div className="score-gauge-container animate-scale-in">
      <div className="score-gauge" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="gradient-high" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="gradient-mid" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <linearGradient id="gradient-low" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <circle
            className="score-gauge-bg"
            cx={size / 2}
            cy={size / 2}
            r={radius}
          />
          <circle
            className="score-gauge-fill"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getStrokeColor()}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="score-gauge-value">
          <span className={`score-number ${getScoreClass()}`}>{animatedScore}</span>
          <span className="score-label">ATS Score</span>
        </div>
      </div>
    </div>
  );
}
