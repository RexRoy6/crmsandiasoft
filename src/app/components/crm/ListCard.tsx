import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  extra?: string[];
  link: string;
};

export default function ListCard({
  title,
  description,
  extra,
  link,
}: Props) {
  return (
    <div
      style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
      }}
    >
      <strong>{title}</strong>

      {description && <p>{description}</p>}

      {extra &&
        extra.map((item, i) => <p key={i}>{item}</p>)}

      <Link href={link}>
        <button>Manage</button>
      </Link>
    </div>
  );
}