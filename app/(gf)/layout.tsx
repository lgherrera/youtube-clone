// app/(gf)/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GF Section - Video Streaming Platform",
  description: "GF premium video content",
};

export default function GFLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-black">
      <main>{children}</main>
    </div>
  );
}