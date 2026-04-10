import { useEffect, useRef, useState } from 'react';

export default function AnimatedGauge({ score = 0, size = 160 }) {
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

  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getStrokeColor = () => {
    if (animatedScore >= 70) return 'url(#gauge-grad-high)';
    if (animatedScore >= 40) return 'url(#gauge-grad-mid)';
    return 'url(#gauge-grad-low)';
  };

  const getTextColor = () => {
    if (animatedScore >= 70) return '#10b981';
    if (animatedScore >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="gauge-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="gauge-grad-high" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="gauge-grad-mid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="gauge-grad-low" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Animated fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            transition: 'stroke-dashoffset 0.3s ease',
          }}
        />
      </svg>
      <div className="gauge-text">
        <div className="gauge-score" style={{ color: getTextColor() }}>
          {animatedScore}
        </div>
        <div className="gauge-label">/100</div>
      </div>
    </div>
  );
}
