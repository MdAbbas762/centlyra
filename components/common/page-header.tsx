import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description: string
  actions?: ReactNode
  eyebrow?: string
}

export function PageHeader({ title, description, actions, eyebrow }: PageHeaderProps) {
  return (
    <header className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[clamp(2rem,5vw,2.75rem)] leading-[1.13] tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">{description}</p>
      </div>
      {actions && (
        <div className="flex min-w-0 flex-wrap items-center gap-2.5 xl:shrink-0 xl:justify-end">{actions}</div>
      )}
    </header>
  )
}
