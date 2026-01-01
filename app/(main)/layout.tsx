// app/(main)/layout.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      
      <main className="flex-1 max-w-[500px] mx-auto w-full">
        {children}
      </main>

      <Footer />
    </>
  );
}