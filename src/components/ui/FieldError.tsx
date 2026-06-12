type FieldErrorProps = {
  id: string;
  message?: string;
};

export default function FieldError({ id, message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="body-compact" style={{ color: "#B96565" }}>
      {message}
    </p>
  );
}
