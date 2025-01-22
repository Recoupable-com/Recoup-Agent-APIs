import fs from "fs/promises";

const loadCookies = async (scraper: any, cookies_path: string) => {
  try {
    await fs.access(cookies_path);
    const cookiesData = await fs.readFile(cookies_path, "utf-8");
    const cookies = JSON.parse(cookiesData);
    await scraper.setCookies(cookies);
    return true;
  } catch (error) {
    return false;
  }
};

export default loadCookies;
