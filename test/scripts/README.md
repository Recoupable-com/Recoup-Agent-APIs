# Instagram Scraper Test Scripts

This directory contains test scripts to verify the functionality of the Instagram scraper components without running the entire application.

## Available Test Scripts

### 1. Test Instagram Profile Scraper

Tests the direct scraping function for Instagram profiles.

```bash
npx ts-node test/scripts/test-instagram-scraper.ts <instagram_username>
```

Example:

```bash
npx ts-node test/scripts/test-instagram-scraper.ts instagram
```

This script will:

- Fetch the profile data for the specified Instagram username
- Display the extracted data (avatar, bio, follower count, following count)
- Indicate if any required fields are missing

### 2. Test Instagram Profile Enhancer

Tests the profile enhancement function that's used in the comment social creation flow.

```bash
npx ts-node test/scripts/test-instagram-enhancer.ts <instagram_username1> [<instagram_username2> ...]
```

Example:

```bash
npx ts-node test/scripts/test-instagram-enhancer.ts instagram nasa
```

This script will:

- Create test profile objects for the specified usernames
- Enhance them using the enhanceInstagramProfiles function
- Display the enhanced profiles with all extracted data
- Indicate if any required fields are missing

## Troubleshooting

If you encounter any issues:

1. Make sure you have ts-node installed:

```bash
npm install -g ts-node
```

2. Check that the Instagram username exists and is publicly accessible

3. If you're getting rate-limited, try waiting a few minutes before retrying

4. For persistent issues, try using a different Instagram username for testing
