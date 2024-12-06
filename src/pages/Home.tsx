import { Link } from 'react-router-dom';
import { Command, Search, Layout } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MetaTags } from '@/components/layout/MetaTags';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  ctaText: string;
}

function FeatureCard({ icon, title, description, to, ctaText }: FeatureCardProps) {
  return (
    <Link to={to} className="block transition-transform hover:scale-[1.02]">
      <Card className="h-full p-6 border-accent/20 shadow-lg shadow-accent/10 hover:border-accent/40">
        <div className="flex flex-col h-full space-y-4">
          <div className="rounded-full bg-accent/10 w-12 h-12 flex items-center justify-center">
            <div className="text-accent">{icon}</div>
          </div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground flex-grow">{description}</p>
          <Button className="bg-accent hover:bg-accent/90 w-full mt-4">
            {ctaText}
          </Button>
        </div>
      </Card>
    </Link>
  );
}

export function Home() {
  return (
    <>
      <MetaTags 
        title="Home"
        description="Access powerful Discord management tools including vanity URL checker and user lookup."
      />
      <div className="container px-4 py-16 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-accent to-indigo-500 bg-clip-text text-transparent">
              Discord Management Tools
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Powerful utilities to enhance your Discord server management experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <FeatureCard
            icon={<Command className="w-6 h-6" />}
            title="Vanity URL Checker"
            description="Check availability of custom, memorable URLs for your Discord server. Find the perfect vanity URL for your community."
            to="/vanity"
            ctaText="Check Availability"
          />
          <FeatureCard
            icon={<Search className="w-6 h-6" />}
            title="User Lookup Tool"
            description="Quickly verify Discord users and access detailed profile information. Perfect for moderation and community management."
            to="/lookup"
            ctaText="Search Users"
          />
          <FeatureCard
            icon={<Layout className="w-6 h-6" />}
            title="Usage Statistics"
            description="Track how our Discord management tools are being used by the community. View detailed usage statistics and trends."
            to="/stats"
            ctaText="View Stats"
          />
        </div>
      </div>
    </>
  );
}