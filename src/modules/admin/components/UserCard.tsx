import { User } from "../types/admin";
import { companyStyles } from "@/styles/companyAdmin.styles";

export default function UserCard({ user, onDeactivate }: { user: User, onDeactivate: (userId: number) => void; }) {
  const initials = (user.name ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div style={companyStyles.userCard}>
      <div style={companyStyles.userAvatar}>{initials}</div>

      <div style={{ flex: 1 }}>
        <div style={companyStyles.userName}>{user.name ?? ""}</div>
        <div style={companyStyles.userEmail}>{user.email ?? ""}</div>
      </div>

      <button
        onClick={() => onDeactivate(user.id)}
        style={{
          background: "#fee2e2",
          color: "#991b1b",
          border: "none",
          padding: "6px 10px",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 12,
        }}
      >
        Desactivar
      </button>
    </div>
  );
}
