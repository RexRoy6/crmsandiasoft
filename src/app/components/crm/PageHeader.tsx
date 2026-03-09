type Props = {
  title: string;
  buttonLabel: string;
  onClick: () => void;
};

export default function PageHeader({
  title,
  buttonLabel,
  onClick,
}: Props) {
  return (
    <div
      style={{
        background: "green",
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 20,
      }}
    >
      <h1>{title}</h1>

      <button onClick={onClick}>
        {buttonLabel}
      </button>
    </div>
  );
}