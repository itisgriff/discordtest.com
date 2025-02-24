import { ShieldCheck } from 'lucide-react';
import { Button } from './button';

interface SuccessBannerProps {
  code: string;
  message: string;
}

export function SuccessBanner({ code, message }: SuccessBannerProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(`discord.gg/${code}`);
  };
  
  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="bg-green-100 dark:bg-green-800 rounded-full p-2">
          <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-green-800 dark:text-green-400">
            Available Vanity URL!
          </h3>
          <p className="mt-2 text-gray-700 dark:text-gray-300">{message}</p>
          
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-800/50 rounded border border-green-200 dark:border-green-700">
            <h4 className="font-medium text-gray-800 dark:text-gray-200">How to set this up:</h4>
            <ol className="mt-2 ml-5 list-decimal text-gray-700 dark:text-gray-300 space-y-1">
              <li>Go to your Discord server settings</li>
              <li>Navigate to the "Server Boost" tab</li>
              <li>Once your server has reached Level 3 (14 boosts), you can set <span className="font-mono bg-green-200 dark:bg-green-700 px-1 rounded">{code}</span> as your server's vanity URL</li>
            </ol>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleCopy}
            >
              Copy discord.gg/{code}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 