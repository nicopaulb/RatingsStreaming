function saveOptions(e) {
  e.preventDefault();

  var options = {};
  // Cache duration
  options["cacheLife"] = document.querySelector("#cacheLife").value;
  // Ratings source
  options["enabledSource"] = Array.from(document.querySelectorAll("input[type=checkbox][name=ratingSource]:checked")).map((source) => source.value)
  // Ratings on thumbnail
  options["thumbnailRating"] = document.querySelector("input[type=checkbox][name=thumbnailRating]").checked;

  browser.storage.local.set({
    options: options,
  });
  browser.runtime.reload();
}

async function restoreOptions() {
  options = (await browser.storage.local.get("options")).options || {};

  // Cache duration
  document.querySelector("#cacheLife").value = options.cacheLife || "604800000";
  // Ratings source
  if(options.enabledSource) {
    document.querySelectorAll("input[type=checkbox][name=ratingSource]").forEach((source) => {
        source.checked = options.enabledSource.includes(source.value);
    });
  }
  // Ratings on thumbnail
  document.querySelector("input[type=checkbox][name=thumbnailRating]").checked = options.thumbnailRating || false;
}


document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
