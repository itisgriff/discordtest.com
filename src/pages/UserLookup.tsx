import { useState } from 'react';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { lookupUser } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { DiscordUser } from '@/types/discord';

export function UserLookup() {
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    setLoading(true);
    setUser(null);
    try {
      const result = await lookupUser(username);
      if (result) {
        setUser(result);
      } else {
        toast({
          variant: "destructive",
          title: "Not Found",
          description: "User not found. Please check the username and try again.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch user data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4">
      <h1 className="mb-6 text-4xl font-bold tracking-tight">
        <span className="bg-gradient-to-r from-accent to-indigo-500 bg-clip-text text-transparent">
          Discord User Lookup
        </span>
      </h1>
      <p className="mb-8 text-muted-foreground">
        Look up Discord user information by username.
      </p>

      <Card className="p-6 border-accent/20 shadow-lg shadow-accent/10">
        <div className="flex gap-4">
          <Input
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 bg-background/50"
          />
          <Button 
            onClick={handleSearch} 
            disabled={loading || !username}
            className="bg-accent hover:bg-accent/90"
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>

        {user && (
          <div className="mt-6 space-y-6">
            <div className="flex items-start gap-6">
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-24 w-24 rounded-full"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                <div className="mt-2 flex gap-2">
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

            <div className="text-sm text-muted-foreground">
              Account created: {format(user.createdAt, 'PPP')}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}