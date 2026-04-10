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
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    prevScore.current = end;
  }, [score]);

  const strokeWidth = 12;
  const radius = 70;
  const viewSize = (radius + strokeWidth) * 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const center = viewSize / 2;

  const getStrokeColor = () => {
    if (animatedScore >= 70) return '#10B981';
    if (animatedScore >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const getBgStroke = () => 'rgba(255, 255, 255, 0.1)';

  return (
    <div className="gauge-container" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewSize} ${viewSize}`}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={getBgStroke()}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
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
          }}
        />
      </svg>
      <div className="gauge-text">
        <div className="gauge-score" style={{ color: getStrokeColor() }}>
          {animatedScore}
        </div>
        <div className="gauge-subscript">/100</div>
      </div>
    </div>
  );
}
