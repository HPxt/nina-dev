
"use client";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-foreground sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="font-body text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div>{actions}</div>}
    </header>
  );
}
