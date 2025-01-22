"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTweets = void 0;
const agent_twitter_client_1 = require("agent-twitter-client");
const consts_js_1 = require("../consts.js");
const processTweetData_js_1 = __importDefault(require("./processTweetData.js"));
const path_1 = __importDefault(require("path"));
const loadCookies_js_1 = __importDefault(require("./loadCookies.js"));
const saveCookies_js_1 = __importDefault(require("./saveCookies.js"));
const getAllTweets = async (scraper, handle) => {
    const allTweets = new Map();
    let previousCount = 0;
    let stagnantBatches = 0;
    const MAX_STAGNANT_BATCHES = 2;
    const username = process.env.TWITTER_USERNAME;
    const password = process.env.TWITTER_PASSWORD;
    const email = process.env.TWITTER_EMAIL;
    const cookies_path = path_1.default.join(process.cwd(), "cookies", `${username}_cookies.json`);
    try {
        await (0, loadCookies_js_1.default)(scraper, cookies_path);
        const isLoggedIn = await scraper.isLoggedIn();
        if (!isLoggedIn) {
            await scraper.login(username, password, email);
            const isNewLoggedIn = await scraper.isLoggedIn();
            if (isNewLoggedIn)
                await (0, saveCookies_js_1.default)(scraper, cookies_path);
        }
        const searchResults = scraper.searchTweets(`to:${handle}`, consts_js_1.MAX_TWEETS, agent_twitter_client_1.SearchMode.Latest);
        for await (const tweet of searchResults) {
            if (tweet && !allTweets.has(tweet.id)) {
                const processedTweet = (0, processTweetData_js_1.default)(tweet);
                if (processedTweet) {
                    allTweets.set(tweet.id, processedTweet);
                    if (allTweets.size % 100 === 0) {
                        if (allTweets.size === previousCount) {
                            stagnantBatches++;
                            if (stagnantBatches >= MAX_STAGNANT_BATCHES) {
                                break;
                            }
                        }
                        else {
                            stagnantBatches = 0;
                        }
                        previousCount = allTweets.size;
                    }
                }
            }
        }
        return Array.from(allTweets.values());
    }
    catch (error) {
        console.error(error);
        return { error };
    }
};
exports.getAllTweets = getAllTweets;
exports.default = exports.getAllTweets;
