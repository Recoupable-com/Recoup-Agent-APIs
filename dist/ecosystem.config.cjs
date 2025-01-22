"use strict";
module.exports = {
    apps: [
        {
            name: "recoup-agent-apis",
            script: "bun",
            args: "start",
            cron_restart: "0 */12 * * *",
            watch: false,
            autorestart: true,
        },
    ],
};
