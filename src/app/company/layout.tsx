import { getAuthContext } from "@/lib/auth/getAuthContext";
import CompanyShell from "./CompanyShell";

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const auth = await getAuthContext();

  return (
    <CompanyShell
      role={auth.role}
    >
      {children}
    </CompanyShell>
  );
}