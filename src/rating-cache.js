async function addRatingsToCache(movie, ratings) {
  await browser.storage.local.set({
    [movie]: { ratings: ratings, timestamp: Date.now() },
  });
}

async function getRatingsFromCache(movie) {
  cache = await browser.storage.local.get([movie, "cacheLife"]);
  maxCacheDuration = cache.cacheLife;

  if (Object.hasOwn(cache, movie)) {
    if (Date.now() - cache[movie]["timestamp"] > maxCacheDuration) {
      // Cache expired
      console.log("Cache expired");
      browser.storage.local.remove(movie);
      return {};
    } else {
      return cache[movie]["ratings"];
    }
  }
  return {};
}
