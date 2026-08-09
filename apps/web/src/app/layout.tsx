import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vũ Đài TOEIC — Học như một đấu sĩ",
  description: "Chinh phục TOEIC 4 kỹ năng qua những trận đấu, nâng cấp nhân vật và hành trình tiến tới 990 điểm.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
