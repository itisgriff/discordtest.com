import { useState } from 'react';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { lookupUser } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import type { DiscordUser } from '@/types/discord';

export function UserLookup() {
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!userId.match(/^\d+$/)) {
      toast.error("Please enter a valid Discord user ID (numbers only)");
      return;
    }

    setLoading(true);
    setUser(null);
    try {
      const result = await lookupUser(userId);
      if (result) {
        setUser(result);
      } else {
        toast.error("User not found. Please check the ID and try again.");
      }
    } catch (error) {
      toast.error("Failed to lookup user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="flex-1 bg-background/50"
          />
          <Button 
            onClick={handleSearch} 
            disabled={loading || !userId}
            className="bg-accent hover:bg-accent/90"
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>

        {user && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-24 w-24 rounded-full"
                />
              )}
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {user.badges.map((badge) => (
                    <Badge key={badge} variant="secondary">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {user.banner && (
              <div className="relative h-48 overflow-hidden rounded-lg">
                <img
                  src={user.banner}
                  alt="User banner"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="text-sm text-muted-foreground text-center sm:text-left">
              Account created: {format(user.createdAt, 'PPP')}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}