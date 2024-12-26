import type { Metadata } from "next";
import "./globals.css";
import { AuthGuard } from "@/components/auth-guard";

export const metadata: Metadata = {
  title: "任务清单",
  description: "项目任务管理器。",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased min-h-screen flex flex-col`}
      >
        <AuthGuard>
          <main className="flex-1">
            {children}
          </main>
        </AuthGuard>
      </body>
    </html>
  );
}
