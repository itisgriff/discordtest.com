import { useState, useCallback, memo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { checkVanityUrl } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { MetaTags } from '@/components/layout/MetaTags';
import { Turnstile } from '@/components/ui/turnstile';
import type { GuildInfo } from '@/types/discord';

// Memoized result components
const AvailableResult = memo(function AvailableResult({ code }: { code: string }) {
  return (
    <div className="p-4 bg-green-500/10 text-green-500 rounded-lg animate-fadeIn">
      <p className="font-semibold">✨ Good news!</p>
      <p>The vanity URL "{code}" is available for your server.</p>
    </div>
  );
});

const TakenResult = memo(function TakenResult({ 
  guild,
  onJoin
}: { 
  guild: GuildInfo;
  onJoin: () => void;
}) {
  return (
    <div className="p-4 bg-red-500/10 text-red-500 rounded-lg animate-fadeIn">
      <div className="flex items-center gap-4">
        {guild.icon && (
          <img
            src={guild.icon}
            alt={guild.name}
            className="w-16 h-16 rounded-full"
            loading="lazy"
          />
        )}
        <div>
          <p className="font-semibold">This vanity URL is taken by:</p>
          <p>{guild.name}</p>
          <p className="text-sm opacity-75">
            {guild.memberCount?.toLocaleString()} members
          </p>
          {guild.inviteCode && (
            <Button
              variant="outline"
              className="mt-2"
              onClick={onJoin}
              aria-label={`Join ${guild.name} server`}
            >
              Join Server
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

export function VanityCheck() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  // Memoized handlers
  const handleCheck = useCallback(async () => {
    if (!code) {
      toast.error("Please enter a vanity URL to check");
      return;
    }

    if (window.turnstile && !turnstileToken) {
      toast.error("Please complete the verification challenge");
      return;
    }

    setLoading(true);
    setGuildInfo(null);
    setIsAvailable(null);

    try {
      const result = await checkVanityUrl(code, turnstileToken);
      if (result.error) {
        toast.error(result.error);
      } else {
        setIsAvailable(result.available);
        setGuildInfo(result.guildInfo);
      }
    } catch (error) {
      toast.error("Failed to check vanity URL. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [code, turnstileToken]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.toLowerCase());
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleCheck();
    }
  }, [handleCheck, loading]);

  const handleJoinServer = useCallback((inviteCode: string) => {
    window.open(`https://discord.gg/${inviteCode}`, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <>
      <MetaTags 
        title="Vanity URL Checker"
        description="Check if a Discord vanity URL is available for your server."
      />
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-accent to-indigo-500 bg-clip-text text-transparent">
              Vanity URL Checker
            </span>
          </h1>
          <p className="mb-8 text-muted-foreground">
            Check if your desired vanity URL is available for your Discord server.
          </p>
        </div>

        <Card className="p-6 border-accent/20 shadow-lg shadow-accent/10">
          <div className="flex gap-4">
            <Input
              placeholder="Enter vanity URL"
              value={code}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-background/50"
              aria-label="Vanity URL input"
              maxLength={100}
              pattern="[a-zA-Z0-9-]+"
            />
            <Button 
              onClick={handleCheck}
              disabled={loading || !code || (window.turnstile && !turnstileToken)}
              className="bg-accent hover:bg-accent/90"
              aria-label={loading ? "Checking..." : "Check availability"}
            >
              <Search className="mr-2 h-4 w-4" />
              {loading ? 'Checking...' : 'Check'}
            </Button>
          </div>

          <Turnstile
            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
            onVerify={setTurnstileToken}
          />

          {isAvailable !== null && (
            <div className="mt-6">
              {isAvailable ? (
                <AvailableResult code={code} />
              ) : guildInfo ? (
                <TakenResult 
                  guild={guildInfo} 
                  onJoin={() => handleJoinServer(guildInfo.inviteCode!)} 
                />
              ) : null}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}