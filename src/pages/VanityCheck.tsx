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
  const [isAvailable, setIsAvailable] = useState(false);

  const handleCheck = useCallback(async () => {
    if (!code) {
      toast.error("Please enter a vanity URL to check");
      return;
    }

    setLoading(true);
    setIsAvailable(false);
    try {
      const result = await checkVanityUrl(code);
      
      if (result.error && !result.available) {
        toast.error(result.error);
      }
      
      if (result.available) {
        setIsAvailable(true);
        setGuildInfo(null);
      } else if (result.guildInfo) {
        setIsAvailable(false);
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

            {isAvailable && (
              <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-green-500/20 bg-green-500/10 animate-in fade-in-50">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-500">Available!</h3>
                  <p className="text-sm text-muted-foreground">
                    The vanity URL "discord.com/invite/{code}" is available for your server.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                    toast.success('Copied to clipboard!');
                  }}
                  className="bg-green-500 hover:bg-green-600 min-w-[120px]"
                >
                  Copy URL
                </Button>
              </div>
            )}

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
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {(guildInfo.onlineCount || 0).toLocaleString()} Online · {(guildInfo.memberCount || 0).toLocaleString()} Members
                      </p>
                      
                      {guildInfo.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {guildInfo.description}
                        </p>
                      )}

                      {guildInfo.boostCount > 0 && (
                        <p className="text-sm text-purple-400 mt-1">
                          {guildInfo.boostCount} Server Boost{guildInfo.boostCount !== 1 ? 's' : ''}
                        </p>
                      )}

                      {guildInfo.inviteChannel && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Invite Channel: #{guildInfo.inviteChannel.name}
                        </p>
                      )}
                    </div>

                    {(guildInfo.features.length > 0 || guildInfo.verificationLevel > 0 || guildInfo.nsfwLevel > 0) && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Server Features</h4>
                        <div className="flex flex-wrap gap-1">
                          {guildInfo.verificationLevel > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-500">
                              Verification Level {guildInfo.verificationLevel}
                            </span>
                          )}
                          {guildInfo.nsfwLevel > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-500">
                              NSFW Level {guildInfo.nsfwLevel}
                            </span>
                          )}
                          {guildInfo.isNsfw && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-500">
                              NSFW Server
                            </span>
                          )}
                          {guildInfo.features.map(feature => (
                            <span 
                              key={feature} 
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent-foreground"
                            >
                              {feature.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {guildInfo.splash && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Server Banner</h4>
                        <img 
                          src={guildInfo.splash} 
                          alt="Server Splash"
                          className="w-full h-32 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  asChild
                  className="bg-accent hover:bg-accent/90 min-w-[120px]"
                >
                  <a
                    href={`https://discord.com/invite/${guildInfo.inviteCode}`}
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