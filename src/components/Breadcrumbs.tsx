import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const Breadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => (
  <nav aria-label="Fil d'Ariane" className="container-main py-4">
    <ol className="flex items-center gap-1.5 text-sm font-body text-muted-foreground flex-wrap">
      <li>
        <Link to="/" className="flex items-center gap-1 hover:text-gold transition-colors">
          <Home className="w-3.5 h-3.5" /> Accueil
        </Link>
      </li>
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3" />
          {item.href ? (
            <Link to={item.href} className="hover:text-gold transition-colors">{item.label}</Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumbs;
