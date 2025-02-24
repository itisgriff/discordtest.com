import { ShieldAlert, ExternalLink, Info } from 'lucide-react';
import type { GuildInfo } from '@/types/discord';
import { Button } from './button';

interface TakenVanityInfoProps {
  guild: GuildInfo;
  code: string;
  message?: string | null;
}

export function TakenVanityInfo({ guild, code, message }: TakenVanityInfoProps) {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-2">
          <ShieldAlert className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-400">
            Vanity URL Already In Use
          </h3>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            {message || `The vanity URL "discord.gg/${code}" is already being used by another server.`}
          </p>
          
          <div className="mt-4 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
            <div className="bg-blue-100 dark:bg-blue-800/50 p-3 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {guild.icon && (
                  <img 
                    src={guild.icon} 
                    alt={guild.name} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="font-medium">{guild.name}</span>
              </div>
              {guild.memberCount && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <div className="bg-blue-200 dark:bg-blue-700 rounded-full px-2 py-0.5">
                    {guild.memberCount.toLocaleString()} members
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-white dark:bg-gray-800">
              {guild.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {guild.description}
                </p>
              )}
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                {guild.features.length > 0 && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Features:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {guild.features.slice(0, 3).map(feature => (
                        <span key={feature} className="bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5 text-xs">
                          {feature.replace(/_/g, ' ').toLowerCase()}
                        </span>
                      ))}
                      {guild.features.length > 3 && (
                        <span className="bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5 text-xs">
                          +{guild.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {guild.boostCount !== undefined && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Boosts:</span>
                    <div className="mt-1">
                      <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded px-1.5 py-0.5 text-xs">
                        Level {Math.floor(guild.boostCount / 7)} ({guild.boostCount} boosts)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-200 dark:border-blue-800"
              onClick={() => window.open(`https://discord.gg/${code}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Visit Server
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-200 dark:border-blue-800"
              onClick={() => {
                // Suggest a new search by modifying the current vanity code
                // This is just a placeholder - could be improved with actual suggestions
                const suggestion = `${code}${Math.floor(Math.random() * 100)}`;
                window.location.href = `/vanity/${suggestion}`;
              }}
            >
              <Info className="w-4 h-4 mr-1" />
              Try Similar Names
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 