/**
 * Decodes escaped URLs from TikTok's response
 */
function decodeEscapedUrl(url: string): string {
  try {
    return decodeURIComponent(url.replace(/\\u002F/g, "/"));
  } catch (e) {
    return url;
  }
}

export default decodeEscapedUrl;
