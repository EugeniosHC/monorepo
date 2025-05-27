import { cn } from "@eugenios/ui/lib/utils";

export default function PageSection({
  id,
  className,
  children,
}: React.PropsWithChildren<{ id?: string; className?: string }>) {
  return (
    <section id={id} className={cn(className)}>
      <div className="container-layout">{children}</div>
    </section>
  );
}
