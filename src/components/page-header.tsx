export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        <h1 className="truncate text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
      </div>
      {action}
    </header>
  );
}

export function PageContainer({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 md:px-8 md:pt-10">{children}</main>;
}
