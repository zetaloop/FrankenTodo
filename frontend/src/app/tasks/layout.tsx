export default function TasksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {children}
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
    </div>
  )
} 