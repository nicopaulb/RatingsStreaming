var config = {};

async function getConfig() {
  config = (await browser.storage.local.get("options")).options || {};
}

function getCacheLife() {
  return config.cacheLife || 604800000;
}

function getRetryDelay() {
  return config.retryDelay || 3600000;
}

function getRequestDelay() {
  return config.requestDelay || 1000;
}

function getRatingsSource() {
  return config.enabledSource || ["IMDb", "RottenTomatoes", "Allocine"];
}

function getThumbnailRating() {
  return config.thumbnailRating || true;
}
