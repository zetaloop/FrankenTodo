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
          <footer className="w-full py-6 md:px-8 md:py-0">
            <div className="mx-auto max-w-screen-xl flex items-center justify-center gap-4 md:h-16">
              <p className="text-center text-sm leading-loose text-muted-foreground">
                FrankenTodo v0.1.0 designed by{" "}
                <a
                  href="https://github.com/zetaloop"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  zetaloop
                </a>
              </p>
            </div>
          </footer>
        </AuthGuard>
      </body>
    </html>
  );
}
