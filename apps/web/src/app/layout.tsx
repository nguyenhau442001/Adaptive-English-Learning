import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vũ Đài TOEIC — Thi đấu và học tiếng Anh nâng cao",
  description: "Chinh phục TOEIC 4 kỹ năng và luyện Executive English C1–C2 qua bài học tình huống kèm bài tập ghi nhớ.",
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
