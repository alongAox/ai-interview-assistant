import AuthGuard from "@/components/AuthGuard";
import UserBar from "@/components/UserBar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <UserBar />
      {children}
    </AuthGuard>
  );
}
