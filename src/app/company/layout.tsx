import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar />

        <main style={{ flex: 1, padding: 40, background: "#f5f7fb" }}>
          {children}
        </main>
      </div>
    </div>
  );
}