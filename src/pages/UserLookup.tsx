import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { lookupUser } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { format } from 'date-fns';
import { getUserFlags } from '@/lib/utils/userFlags';
import { MetaTags } from '@/components/layout/MetaTags';
import type { DiscordUser } from '@/types/discord';

export default function UserLookup() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<DiscordUser | null>(null);

  const handleSearch = useCallback(async () => {
    if (!userId) {
      toast.error("Please enter a user ID");
      return;
    }

    setLoading(true);
    try {
      const result = await lookupUser(userId);
      
      if (!result) {
        toast.error('Failed to lookup user');
        return;
      }

      if ('error' in result && typeof result.error === 'string') {
        toast.error(result.error);
      } else {
        setUser(result);
      }
    } catch (error) {
      console.error('API Error:', error);
      toast.error('Failed to lookup user');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  return (
    <>
      <MetaTags 
        title="User Lookup"
        description="Look up Discord user information using their ID."
      />
      
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
          User Lookup
        </h1>
        
        <p className="text-muted-foreground text-center mb-8">
          Look up Discord user information using their ID.
        </p>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
                disabled={loading || !userId}
                className="bg-accent hover:bg-accent/90 min-w-[100px]"
                aria-label={loading ? "Loading..." : "Search"}
              >
                {loading ? "Loading..." : "Search"}
              </Button>
            </div>

            {user && (
              <div className="flex items-center gap-4 p-4 bg-card rounded-lg border animate-in fade-in-50">
                {user.avatar && (
                  <img 
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`}
                    alt={`${user.username}'s avatar`}
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {user.global_name || user.username}
                    {user.discriminator !== '0' && (
                      <span className="text-muted-foreground">#{user.discriminator}</span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Created {format(new Date(user.createdAt), 'PPP')}
                  </p>
                </div>
              </div>
            )}

            {user?.flags && (
              <div className="flex flex-wrap gap-2 p-4 bg-card rounded-lg border animate-in fade-in-50 slide-in-from-top-2">
                {getUserFlags(user.flags).map(flag => (
                  <Badge key={flag} variant="secondary">
                    {flag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}