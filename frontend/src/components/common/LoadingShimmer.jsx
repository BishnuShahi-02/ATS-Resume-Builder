export default function LoadingShimmer() {
  return (
    <div className="glass-card-static animate-fade-in">
      <div className="shimmer-circle shimmer" />
      <div className="shimmer-line tall shimmer" style={{ width: '50%', margin: '0 auto var(--space-lg)' }} />
      <div className="shimmer-line shimmer" />
      <div className="shimmer-line short shimmer" />
      <div className="shimmer-line shimmer" />
      <div className="shimmer-line shorter shimmer" />
      <div style={{ height: 'var(--space-lg)' }} />
      <div className="shimmer-line shimmer" />
      <div className="shimmer-line short shimmer" />
      <div className="shimmer-line shimmer" />
    </div>
  );
}
