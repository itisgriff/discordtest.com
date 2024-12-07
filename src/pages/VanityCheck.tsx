import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { checkVanityUrl } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { MetaTags } from '@/components/layout/MetaTags';
import type { GuildInfo } from '@/types/discord';

export default function VanityCheck() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null);

  const handleCheck = useCallback(async () => {
    if (!code) {
      toast.error("Please enter a vanity URL to check");
      return;
    }

    setLoading(true);
    try {
      const result = await checkVanityUrl(code);
      
      if (result.error) {
        if (result.available) {
          toast.success(result.error);
        } else {
          toast.error(result.error);
        }
      }
      
      if (result.available) {
        setGuildInfo(null);
      } else if (result.guildInfo) {
        setGuildInfo(result.guildInfo);
      }
    } catch (error) {
      console.error('API Error:', error);
      toast.error('Failed to check vanity URL');
    } finally {
      setLoading(false);
    }
  }, [code]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleCheck();
    }
  };

  return (
    <>
      <MetaTags 
        title="Vanity URL Checker"
        description="Check if your desired vanity URL is available for your Discord server."
      />
      
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
          Vanity URL Checker
        </h1>
        
        <p className="text-muted-foreground text-center mb-8">
          Check if your desired vanity URL is available for your Discord server.
        </p>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter vanity URL"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="flex-1"
              />
              <Button 
                onClick={handleCheck}
                disabled={loading || !code}
                className="bg-accent hover:bg-accent/90 min-w-[120px]"
                aria-label={loading ? "Checking..." : "Check availability"}
              >
                {loading ? "Checking..." : "Check"}
              </Button>
            </div>

            {guildInfo && (
              <div className="flex items-center gap-4 p-4 bg-card rounded-lg border animate-in fade-in-50">
                {guildInfo.icon && (
                  <img 
                    src={guildInfo.icon} 
                    alt={`${guildInfo.name} icon`}
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{guildInfo.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(guildInfo.memberCount ?? 0).toLocaleString()} members
                  </p>
                </div>
                <Button
                  asChild
                  className="bg-accent hover:bg-accent/90 min-w-[120px]"
                >
                  <a
                    href={`https://discord.gg/${guildInfo.inviteCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join Server
                  </a>
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}