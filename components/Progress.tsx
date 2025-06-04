export function Progress({
  value,
  max = 5,
  rightText = "",
  leftText = "",
}: {
  value: number;
  max?: number;
  rightText?: string;
  leftText?: string;
}) {
  return value ? (
    <div className="is-flex is-align-items-center is-column-gap-1">
      <small style={{ width: 130 }}>{leftText}</small>
      <progress
        className="progress mb-0 is-small"
        max={max}
        value={value}
      ></progress>
      <small className="has-text-right" style={{ width: 130 }}>
        {rightText}
      </small>
    </div>
  ) : null;
}
