function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    cacheLife: document.querySelector("#cacheLife").value,
  });
}

function restoreOptions() {
  function setCurrentChoice(result) {
    document.querySelector("#cacheLife").value = result.cacheLife || "604800000";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  let getting = browser.storage.local.get("cacheLife");
  getting.then(setCurrentChoice, onError);
}

console.log("options");
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
