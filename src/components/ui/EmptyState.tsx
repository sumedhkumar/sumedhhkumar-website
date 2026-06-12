type EmptyStateProps = {
  heading: string;
  copy: string;
};

export default function EmptyState({ heading, copy }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <h3 className="card-title">{heading}</h3>
      <p className="body-compact">{copy}</p>
    </div>
  );
}
