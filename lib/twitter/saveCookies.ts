import path from "path";
import fs from "fs/promises";

const saveCookies = async (scraper: any, cookies_path: string) => {
  try {
    const cookies = await scraper.getCookies();
    const cookiesString = cookies.map((cookie: any) => cookie.toString());
    await fs.mkdir(path.dirname(cookies_path), { recursive: true });
    await fs.writeFile(cookies_path, JSON.stringify(cookiesString));
  } catch (error) {
    return { error };
  }
};

export default saveCookies;
