# Instructions

## Goal: fix the wrapped funnel

## Instructions

1.  ✅ P1: API missing Files - README - overview - getting started - license - License - MIT - author: @sweetman

2.  ✅ create .env.example file
3.  ✅ fix the github pipeline. - actual: when I push to github, the pipeline runs successfully, but the app very soon crashes. If I ssh into the droplet, the app runs successfully when I run the same command `pm2 restart ecosystem.config.cjs --update-env` - error message
    `        /root/.pm2/logs/recoup-agent-apis-error.log last 15 lines:
0|recoup-a | $ bun x tsc && nodemon --experimental-specifier-resolution=node --no-warnings ./dist/app.js
0|recoup-a | /usr/bin/bash: line 1: bun: command not found
0|recoup-a | error: script "start" exited with code 127
0|recoup-a | $ bun x tsc && nodemon --experimental-specifier-resolution=node --no-warnings ./dist/app.js
0|recoup-a | /usr/bin/bash: line 1: bun: command not found
0|recoup-a | error: script "start" exited with code 127
0|recoup-a | $ bun x tsc && nodemon --experimental-specifier-resolution=node --no-warnings ./dist/app.js
0|recoup-a | /usr/bin/bash: line 1: bun: command not found
0|recoup-a | error: script "start" exited with code 127
0|recoup-a | $ bun x tsc && nodemon --experimental-specifier-resolution=node --no-warnings ./dist/app.js
0|recoup-a | /usr/bin/bash: line 1: bun: command not found
0|recoup-a | error: script "start" exited with code 127
0|recoup-a | $ bun x tsc && nodemon --experimental-specifier-resolution=node --no-warnings ./dist/app.js
0|recoup-a | /usr/bin/bash: line 1: bun: command not found
0|recoup-a | error: script "start" exited with code 127` - required: when I push to github, the pipeline runs successfully, and the app runs successfully.

4.  ✅ yarn => pnpm

    - actual: using yarn
    - required: using pnpm
      - lock file
      - README
      - ecosystem config file
      - package.json

5.  ✅ pilotId -> agents table

    - actual: using randomly generated pilotId
    - required: create a new record in the agents table, and use the pilotId as the id from the new record in agents.id

6.  ✅ createAgent lib

    - actual: supabase insert code is in the PilotController
    - required: move supabase insert code to the createAgent lib

7.  ✅ getTwitterAnalysis - socials table

    - actual: socials table is not being referenced to lookup / insert the new twitter handle
    - required: get the socials id to pass into beginAnalysis

8.  ✅ beginAnalysis - agent_status table

    - actual: beginAnalysis calls legacy funnel_analytics table
    - required: beginAnalysis adds a new record to the agent_status table with the status of the analysis

9.  ✅ getInstagramAnalysis - socials table

    - actual: socials table is not being referenced to lookup / insert the new instagram handle
    - required: get the socials id to pass into beginAnalysis

10. ✅ P0: instagram funnel - agent_status table - progress and status

    - actual: progress and status are set to 0 initially, when the analysis completes, the status is not updated to "FINISHED" status
    - required: update the progress and status to the agent_status table when the analysis completes
      - also update the status record at each step of the funnel.
        - where is a type or ENUM we can reference to know the available options for progress and status?

11. ✅ P0: instagram funnel - posts table - missing records

    - actual: posts are not being saved to posts table during instagram funnel
    - required: save the posts to the posts table after they are scraped in the funnel
      - also add the social_posts rows for the same posts records to be associated with the social_id being scraped

12. ✅ P0: instagram funnel - post_comments table - missing records

    - actual: post comments are not being saved to post_comments table during instagram funnel
    - required: save the post comments to the post_comments table after they are scraped in the funnel

13. ✅ P0: instagram funnel - status API fails

    - actual: status API crashes before returning the status
    - required: return the status of the funnel from the agent_status table
      - path: controllers/GlobalController.ts
      - method: get_autopilot

14. ✅ P0: failed wrapped

        - actual: if one of my accounts does not have engagement, the ENTIRE wrapped funnel fails
        - required: if one of my accounts does not have engagement, but other DO have engagement, the wrapped funnel still completes successfully

15. ✅ P0: Migrate segment storage from funnel_analytics_segments to artist_fan_segments

    - actual:
      - Segments are currently stored in funnel_analytics_segments table during analysis
      - This creates a disconnect between analysis-time segments and persistent fan segments
      - Each funnel type (Instagram, Twitter, TikTok, Spotify) saves segments differently
    - required:
      - Create a new lib function `saveArtistFanSegments` to handle segment storage
      - Update all funnel analysis flows to use the new function
      - Ensure consistent segment storage across all funnel types
      - Remove usage of funnel_analytics_segments table

16. [x] P0: Implement saveArtistFanSegments function

    - actual:
      - No centralized function for saving fan segments
      - Different segment saving logic across different funnels
    - required:
      - Create new function in lib/supabase/saveArtistFanSegments.ts
      - Function should:
        - Take segments, artist_id, and account_id as parameters
        - Handle upsert to artist_fan_segments table
        - Ensure no duplicate segments for same artist
        - Return saved segment IDs for reference

17. [x] P0: Refactor segment generation for artist-centric analysis

    - actual:
      - get_segments in GlobalController.ts returns segments but does not save them
      - Segments are only saved during social analysis
      - This creates a disconnect where:
        - Segments shown in UI may not be saved to database
        - Manual segment generation doesn't persist
        - Inconsistent segment storage behavior
    - required:
      - Update get_segments in GlobalController.ts to:
        - Accept artist_id parameter
        - Call saveArtistFanSegments after generating segments
        - Return both generated and saved segments
      - Remove segment generation from agents
      - Single source of truth for segment generation and storage
      - Consistent behavior whether segments are generated during analysis or via API

18. [ ] P1: instagram - steps

    - actual:
      - The Instagram agent currently transitions through the following steps: PROFILE, SETTING_UP_ARTIST, and FINISHED.
    - required:
      - Expand the Instagram agent's process to include additional steps:
        - POSTURLS: Fetch and process the URLs of Instagram posts.
        - POST_COMMENTS: Retrieve and handle comments associated with each post.
      - Ensure that these new steps integrate seamlessly into the existing flow, providing a more comprehensive scraping and processing of Instagram data.
