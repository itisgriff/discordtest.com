import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { lookupUser } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { format } from 'date-fns';
import { getUserFlags } from '@/lib/utils/userFlags';
import { MetaTags } from '@/components/layout/MetaTags';
import type { DiscordUser } from '@/types/discord';

export function UserLookup() {
  const [inputUserId, setInputUserId] = useState('');
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!inputUserId.match(/^\d+$/)) {
      toast.error("Please enter a valid Discord user ID (numbers only)");
      return;
    }

    setLoading(true);
    try {
      const result = await lookupUser(inputUserId);
      if (result) {
        setUser(result);
      }
    } catch (error) {
      toast.error("Failed to lookup user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MetaTags 
        title="User Lookup"
        description="Look up detailed Discord user information including badges, flags, and profile details."
      />
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-accent to-indigo-500 bg-clip-text text-transparent">
              Discord User Lookup
            </span>
          </h1>
          <p className="mb-8 text-muted-foreground">
            Look up Discord user information by user ID.
          </p>
        </div>

        <Card className="p-6 border-accent/20 shadow-lg shadow-accent/10">
          <div className="flex gap-4">
            <Input
              placeholder="Enter user ID"
              value={inputUserId}
              onChange={(e) => setInputUserId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleSearch();
                }
              }}
              className="flex-1 bg-background/50"
            />
            <Button 
              onClick={handleSearch}
              disabled={loading || !inputUserId}
              className="bg-accent hover:bg-accent/90"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>

          {user && (
            <div className="mt-6 space-y-6 animate-fadeIn">
              {/* User Header */}
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                {user.avatar && (
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="h-24 w-24 rounded-full"
                    />
                    {user.avatar_decoration_data && (
                      <div className="absolute -top-2 -right-2">
                        <Badge>Premium</Badge>
                      </div>
                    )}
                  </div>
                )}
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold">{user.global_name || user.username}</h2>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                  <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                  {user.discriminator !== "0" && (
                    <p className="text-sm text-muted-foreground">#{user.discriminator}</p>
                  )}
                </div>
              </div>

              {/* User Details */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Flags and Badges */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Badges</h3>
                  <div className="flex flex-wrap gap-2">
                    {getUserFlags(user.flags).map((flag) => (
                      <Badge key={flag} variant="secondary">
                        {flag}
                      </Badge>
                    ))}
                    {user.flags !== user.public_flags && 
                      getUserFlags(user.public_flags).map((flag) => (
                        <Badge key={flag} variant="outline">
                          {flag} (Public)
                        </Badge>
                      ))
                    }
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Colors</h3>
                  {user.accent_color && (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: `#${user.accent_color.toString(16)}` }}
                      />
                      <span>Accent Color: #{user.accent_color.toString(16)}</span>
                    </div>
                  )}
                  {user.banner_color && (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: user.banner_color }}
                      />
                      <span>Banner Color: {user.banner_color}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Banner */}
              {user.banner && (
                <div className="relative h-48 overflow-hidden rounded-lg">
                  <img
                    src={user.banner}
                    alt="User banner"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Guild Information */}
              {(user.clan.identity_enabled || user.primary_guild.identity_enabled) && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Guild Information</h3>
                  {user.clan.identity_enabled && (
                    <div>
                      <h4 className="text-sm font-medium">Clan</h4>
                      {user.clan.tag && <p className="text-sm">Tag: {user.clan.tag}</p>}
                    </div>
                  )}
                  {user.primary_guild.identity_enabled && (
                    <div>
                      <h4 className="text-sm font-medium">Primary Guild</h4>
                      {user.primary_guild.tag && <p className="text-sm">Tag: {user.primary_guild.tag}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* Account Creation */}
              <div className="text-sm text-muted-foreground">
                Account created: {format(user.createdAt, 'PPP')}
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}