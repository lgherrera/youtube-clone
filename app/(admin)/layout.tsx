// app/(admin)/layout.tsx
import AdminHeader from "@/components/AdminHeader";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AdminHeader />
      
      <main className="flex-1 max-w-[500px] mx-auto w-full">
        {children}
      </main>
    </>
  );
}