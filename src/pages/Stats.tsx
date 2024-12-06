import { Card } from '@/components/ui/card';
import { MetaTags } from '@/components/layout/MetaTags';
import { BarChart3, Users, Link as LinkIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}

interface Stats {
  totalLookups: number;
  availableVanities: number;
  takenVanities: number;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card className="p-6 border-accent/20 shadow-lg shadow-accent/10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value.toLocaleString()}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="rounded-full bg-accent/10 p-3">
          <div className="text-accent">{icon}</div>
        </div>
      </div>
    </Card>
  );
}

export function Stats() {
  const [stats, setStats] = useState<Stats>({
    totalLookups: 0,
    availableVanities: 0,
    takenVanities: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <MetaTags 
        title="Usage Statistics"
        description="View usage statistics for DiscordTest's tools including vanity URL checks and user lookups."
      />
      <div className="container px-4 py-16 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-accent to-indigo-500 bg-clip-text text-transparent">
              Usage Statistics
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Track how our Discord management tools are being used by the community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <StatCard
            title="Total User Lookups"
            value={stats.totalLookups}
            icon={<Users className="w-6 h-6" />}
            description="Discord users looked up through our tool"
          />
          <StatCard
            title="Available Vanity URLs"
            value={stats.availableVanities}
            icon={<LinkIcon className="w-6 h-6" />}
            description="Vanity URLs found to be available"
          />
          <StatCard
            title="Taken Vanity URLs"
            value={stats.takenVanities}
            icon={<BarChart3 className="w-6 h-6" />}
            description="Vanity URLs found to be already in use"
          />
        </div>
      </div>
    </>
  );
} 