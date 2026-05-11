interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="py-8 md:py-12 text-center border-b border-border">
      <h2 className="text-sm md:text-base tracking-[0.3em] uppercase text-foreground">
        {title}
      </h2>
    </div>
  );
}
