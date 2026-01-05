import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { navigation } from "@/config/navigation";

export function HomePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-primary">
          Methods, Standards & Work Design
        </h1>
        <p className="text-lg text-muted-foreground">
          Industrial Engineering toolkit based on Niebel & Freivalds, 11th Edition
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {navigation.map((section) => (
          <Card key={section.title} className="hover:border-secondary transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <section.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">{section.title}</CardTitle>
              </div>
              <CardDescription>
                {section.items.length} tools available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {section.items.slice(0, 4).map((item) => (
                  <li key={item.url}>
                    <Link
                      to={item.url}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
                {section.items.length > 4 && (
                  <li className="text-xs text-muted-foreground">
                    +{section.items.length - 4} more...
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-2">About DesignTools</h2>
          <p className="text-sm text-muted-foreground mb-4">
            DesignTools is a comprehensive suite of industrial engineering calculators
            and analysis tools. Originally developed by Dongjoon Kong for McGraw-Hill
            as a companion to the Niebel & Freivalds textbook, this modern web version
            provides the same functionality with an updated interface.
          </p>
          <p className="text-xs text-muted-foreground">
            Version 4.01 • Modernized from VB5 • <a href="https://coe.montana.edu/bioredhub/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">MSU BioReD Hub</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
