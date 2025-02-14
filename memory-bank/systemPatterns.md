# System Patterns

## Architecture Overview
[High-level description of system architecture]

## Design Patterns
[List and explain key design patterns in use]

## Component Structure
[Describe major components and their relationships]

Current Structure:
```mermaid
graph TB
    subgraph Frontend
        React[React App]
        Components[UI Components]
        APILib[API Library]
        React --> Components
        React --> APILib
    end

    subgraph Backend["Backend (Cloudflare Worker)"]
        Worker[Worker Entry]
        Routes[API Routes]
        Services[Discord Service]
        RateLimit[Rate Limiter]
        Cache[Cache Layer]
        
        Worker --> Routes
        Routes --> Services
        Routes --> RateLimit
        Services --> Cache
    end

    subgraph External
        DiscordAPI[Discord API]
    end

    APILib --> Worker
    Services --> DiscordAPI
```

Target Structure (After Migration):
```mermaid
graph TB
    subgraph Frontend
        React[React App]
        Components[UI Components]
        APILib[API Library]
        React --> Components
        React --> APILib
    end

    subgraph "Cloudflare Pages"
        Static[Static Assets]
        Functions[Pages Functions]
        Services[Discord Service]
        RateLimit[Rate Limiter]
        Cache[Cache Layer]
        
        Functions --> Services
        Functions --> RateLimit
        Services --> Cache
    end

    subgraph External
        DiscordAPI[Discord API]
    end

    APILib --> Functions
    Services --> DiscordAPI
    React --> Static
```

Detailed Project Structure After Migration:
```mermaid
graph TB
    subgraph "Project Root"
        subgraph "src/"
            App[App.tsx]
            Pages[pages/]
            Comps[components/]
            Lib[lib/]
            Types[types/]
            
            App --> Pages
            App --> Comps
            Pages --> Lib
            Comps --> Lib
            Lib --> Types
        end

        subgraph "functions/"
            API[api/]
            Services[services/]
            Utils[utils/]
            Config[config/]
            
            API --> Services
            API --> Utils
            Services --> Config
        end

        subgraph "public/"
            Assets[Static Assets]
            HTML[HTML Files]
        end

        Config[Configuration Files]
        Config --> App
        Config --> API
    end

    subgraph "Build Output"
        DistStatic[Static Files]
        DistFunctions[Functions]
    end

    src/ --> DistStatic
    functions/ --> DistFunctions
    public/ --> DistStatic
```

## Data Flow
[Explain how data flows through the system]

## Key Technical Decisions
- [Decision 1 + rationale]
- [Decision 2 + rationale]

## System Constraints
[Document any technical limitations or constraints] 