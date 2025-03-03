/**
 * Add a random delay between min and max milliseconds
 */
async function randomDelay(min = 2000, max = 4000): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(
    `Waiting ${(delay / 1000).toFixed(1)} seconds before next request...`
  );
  await new Promise((resolve) => setTimeout(resolve, delay));
}

export default randomDelay;
