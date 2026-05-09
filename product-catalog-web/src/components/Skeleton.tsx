export function Skeleton() {
  return (
    <div className="skeleton-grid" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton-image" />
          <div className="skeleton-line wide" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      ))}
    </div>
  );
}
