async function addRatingsToCache(movie, ratings) {
  await browser.storage.local.set({
    [movie]: { ratings: ratings, timestamp: Date.now() },
  });
}

async function getRatingsFromCache(movie) {
  cache = await browser.storage.local.get(movie);
  if (Object.hasOwn(cache, movie)) {
    if (Object.keys(cache[movie]["ratings"]).length === 0) {
      // Last tentatives to get ratings failed
      cacheDuration = getRetryDelay();
    } else {
      cacheDuration = getCacheLife();
    }

    if (Date.now() - cache[movie]["timestamp"] > cacheDuration) {
      // Cache expired
      console.debug("Cache expired (CacheLife = " + cacheDuration + ")");
      browser.storage.local.remove(movie);
      return {};
    } else {
      return cache[movie]["ratings"];
    }
  }
  return null;
}
