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
                className="bg-accent hover:bg-accent/90 min-w-[120px]"
                aria-label={loading ? "Loading..." : "Search"}
              >
                {loading ? "Loading..." : "Search"}
              </Button>
            </div>

            {user && (
              <div className="space-y-4 animate-in fade-in-50">
                {/* Basic Info Card */}
                <div className="flex items-start gap-4 p-4 bg-card rounded-lg border">
                  <div className="flex flex-col items-center gap-2">
                    {user.avatar ? (
                      <img 
                        src={user.avatar}
                        alt={`${user.username}'s avatar`}
                        className="w-24 h-24 rounded-full"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-2xl text-accent">{user.username[0]}</span>
                      </div>
                    )}
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(user.id);
                        toast.success('User ID copied to clipboard!');
                      }}
                      variant="outline"
                      className="text-xs"
                    >
                      Copy ID
                    </Button>
                  </div>
                  <div className="flex-1">
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        {user.global_name && (
                          <span className="font-medium">{user.global_name}</span>
                        )}
                        <span className="text-muted-foreground">
                          {user.username}
                          {user.discriminator !== '0' && `#${user.discriminator}`}
                        </span>
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Account Created:</span>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(user.createdAt), 'PPP')}
                          </p>
                        </div>
                        {user.banner && (
                          <div>
                            <span className="text-sm font-medium">Profile Banner:</span>
                            <img 
                              src={user.banner}
                              alt="Profile Banner"
                              className="mt-1 rounded-md w-full h-32 object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges Card */}
                {user.flags && getUserFlags(user.flags).length > 0 && (
                  <div className="p-4 bg-card rounded-lg border">
                    <h4 className="text-sm font-medium mb-3">Profile Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      {getUserFlags(user.flags).map(flag => (
                        <Badge key={flag} variant="secondary" className="capitalize">
                          {flag.toLowerCase().replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bot Info Card */}
                {user.bot && (
                  <div className="p-4 bg-card rounded-lg border">
                    <h4 className="text-sm font-medium mb-2">Bot Account</h4>
                    <p className="text-sm text-muted-foreground">
                      This is a bot account. {'verified' in user && user.verified && 'This bot is verified by Discord.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}