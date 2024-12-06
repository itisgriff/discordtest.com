export function Footer() {
  return (
    <footer className="w-full py-6 mt-auto border-t border-border/40 bg-background/95">
      <div className="container mx-auto max-w-3xl px-4 text-center text-sm text-muted-foreground">
        <p>
          DiscordTest is not affiliated with, endorsed by, or connected to Discord Inc.
          This is an independent tool created for Discord users.
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} DiscordTest. All Discord-related trademarks belong to Discord Inc.
        </p>
      </div>
    </footer>
  );
} 