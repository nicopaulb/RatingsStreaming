async function addRatingsToCache(movie, ratings) {
    await browser.storage.local.set({[movie]:{"ratings":ratings, "timestamp": Date.now()}});
}

async function getRatingsFromCache(movie, maxTime) {
    cache = await browser.storage.local.get(movie);
    if(Object.hasOwn(cache, movie)) {
        if(Date.now() - cache[movie]["timestamp"] > 7 * 24 * 3600 * 1000) {
            // Cache expired
            console.log("Cache expired");
            browser.storage.local.remove(movie);
            return {};
        }
        else {
            return cache[movie]["ratings"];
        }
    }
    return {};
}