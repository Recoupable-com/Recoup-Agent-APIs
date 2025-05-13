import loadCookies from "./loadCookies";
import saveCookies from "./saveCookies";
import path from "path";

export const verifyLoggedIn = async (scraper: any) => {
  const username = process.env.TWITTER_USERNAME;
  const password = process.env.TWITTER_PASSWORD;
  const email = process.env.TWITTER_EMAIL;

  const cookies_path = path.join(
    process.cwd(),
    "cookies",
    `${username}_cookies.json`
  );
  await loadCookies(scraper, cookies_path);
  const isLoggedIn = await scraper.isLoggedIn();
  if (!isLoggedIn) {
    await scraper.login(username, password, email);
    const isNewLoggedIn = await scraper.isLoggedIn();
    if (isNewLoggedIn) await saveCookies(scraper, cookies_path);
  }
};
