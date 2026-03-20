import { User } from "../types/admin";
import { companyStyles } from "@/styles/companyAdmin.styles";

export default function UserCard({ user }: { user: User }) {
  const initials = (user.name ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div style={companyStyles.userCard}>
      <div style={companyStyles.userAvatar}>{initials}</div>

      <div>
        <div style={companyStyles.userName}>{user.name ?? ""}</div>
        <div style={companyStyles.userEmail}>{user.email ?? ""}</div>
      </div>
    </div>
  );
}
