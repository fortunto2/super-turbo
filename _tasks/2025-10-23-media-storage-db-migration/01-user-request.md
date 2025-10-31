# User Request: Migrate Media Storage from localStorage to Database

## Problem

Currently, generated images and videos are stored in localStorage which has several limitations:
- Limited storage capacity (~5-10MB depending on browser)
- No persistence across devices
- No ability to manage large history of generations
- Data can be lost if browser cache is cleared

## Current Implementation

**Image Generation Hook** (`use-image-generation.ts`):
- Stores in `localStorage` with key `image-generation-images`
- Limits to 10 images maximum
- Only stores metadata (URLs point to external services)

**Video Generation Hook** (`use-video-generation.ts`):
- Stores in `localStorage` with key `video-generation-videos`
- Limits to 10 videos maximum
- Only stores metadata (URLs point to external services)

## Requested Solution

Implement database storage for generated media with:
1. Unlimited history for authenticated users
2. Session-based storage for guests
3. Hybrid approach: DB for persistence + localStorage for caching recent items
4. Support for both images and videos
5. Proper user/session association
6. Clean migration path from localStorage

## User Context

- User: pranov.adiletqwe@gmail.com
- Date: 2025-10-23
- Branch: update-media-generation-api
- Database: PostgreSQL with Drizzle ORM
- Authentication: NextAuth with guest session support
