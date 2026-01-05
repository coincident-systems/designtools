import { Link } from "react-router-dom";
import { navigation } from "@/config/navigation";

function ToolCard({ section }: { section: (typeof navigation)[0] }) {
  return (
    <div className="group relative bg-white dark:bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
      {/* Left accent border on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-4">
        {/* Icon with gold background */}
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/25 text-primary dark:text-accent">
          <section.icon className="h-6 w-6" />
        </div>

        <div>
          <h3 className="font-['Jost'] font-semibold text-lg text-[#1a3660] dark:text-foreground tracking-tight">
            {section.title}
          </h3>
          <span className="text-[13px] font-medium text-secondary">
            {section.items.length} tools available
          </span>
        </div>
      </div>

      {/* Tool list with gold bullets */}
      <ul className="space-y-2">
        {section.items.slice(0, 4).map((item) => (
          <li key={item.url} className="relative pl-3">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#c4b97d]" />
            <Link
              to={item.url}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {item.title}
            </Link>
          </li>
        ))}
        {section.items.length > 4 && (
          <li className="pl-3">
            <Link
              to={section.items[0].url}
              className="text-xs text-secondary hover:text-secondary/80 font-medium transition-colors"
            >
              +{section.items.length - 4} more tools →
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}

export function HomePage() {
  return (
    <div className="space-y-8">
      {/* Header with styled title */}
      <div className="space-y-3">
        <h1 className="font-['Jost'] text-[32px] font-bold text-[#1a3660] dark:text-foreground tracking-tight">
          Methods, Standards{" "}
          <span className="relative inline-block">
            & Work Design
            <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-secondary to-[#009BB3] rounded-full" />
          </span>
        </h1>
        <p className="text-[15px] text-muted-foreground">
          Industrial Engineering toolkit based on Niebel & Freivalds, 11th Edition
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {navigation.map((section) => (
          <ToolCard key={section.title} section={section} />
        ))}
      </div>

      {/* About section */}
      <div className="bg-muted/50 dark:bg-muted/20 rounded-lg p-6 border border-border/50">
        <h2 className="font-['Jost'] text-lg font-semibold text-[#1a3660] dark:text-foreground mb-2">
          About DesignTools
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          DesignTools is a comprehensive suite of industrial engineering calculators
          and analysis tools. Originally developed by Dongjoon Kong for McGraw-Hill
          as a companion to the Niebel & Freivalds textbook, this modern web version
          provides the same functionality with an updated interface.
        </p>
        <p className="text-xs text-muted-foreground">
          Version 4.1 • Modernized from VB5 •{" "}
          <a
            href="https://coe.montana.edu/bioredhub/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:underline"
          >
            MSU BioReD Hub
          </a>
        </p>
      </div>
    </div>
  );
}
