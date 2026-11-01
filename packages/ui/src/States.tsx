export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="ob-state" role="status" aria-live="polite">
      <span className="ob-spinner" aria-hidden="true" />
      {label}…
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className="ob-state ob-state--error" role="alert">
      <p>Could not load this section: {error.message}</p>
      {onRetry && (
        <button type="button" className="ob-btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
