const addRatingFunc = {
  IMDb: addImdbRating,
  RottenTomatoes: addRottenTomatoesRating,
  Allocine: addAlloCineRating,
};

async function createDialogSubscription() {
  const targetNode = document.getElementById("application-main-content");
  const config = { childList: true, subtree: true };
  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          addIndividualRatings(node);
          if (getThumbnailRating()) {
            addMenuRatings(node);
          }
        }
        if (getThumbnailRating()) {
          for (const node of mutation.removedNodes) {
            removeMenuRatingsQueue(node);
          }
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}

async function removeMenuRatingsQueue(strateNode) {
  var posters = strateNode.querySelectorAll("a[class^='contentRowTemplateItem'][href], li[class^='contentGrid__gridItem'] a[href]");
  posters = Array.from(posters).filter(a => a.href.match(/\d+$/));
  posters.forEach(async (poster) => {
    if (poster.querySelector("ul.rating-container-list_rs") != null) {
      var title = poster.querySelector("img[height='100%']").alt;
      ratingQueue.removeMovieRating(title);
    }
  });
}

async function addMenuRatings(strateNode) {
  var posters = strateNode.querySelectorAll("a[class^='contentRowTemplateItem'][href], li[class^='contentGrid__gridItem'] a[href]");
  posters = Array.from(posters).filter(a => a.href.match(/\d+$/));
  posters.forEach(async (poster) => {
    if (poster.querySelector("ul.rating-container-list_rs") != null) {
      console.debug("Ratings already added to the page.");
      return;
    }
    var ratingsColumn = document.createElement("ul");
    ratingsColumn.classList.add("rating-container-list_rs");
    ratingsColumn.classList.add("loader_rs");

    var container = poster.querySelector("div.z-10");
    container.appendChild(ratingsColumn);

    var title = poster.querySelector("img[height='100%']").alt;
    if (title == "") {
      console.error("Cannot find the media title");
      return;
    }

    addRatings(ratingsColumn, title);
  });
}

async function addIndividualRatings(mediaNode) {
  var detailsNode = mediaNode.querySelector("div[class^='detailV5__informations']");

  if (detailsNode) {
    // Media details shown
    if (detailsNode.querySelector("ul.rating-container-details_rs") != null) {
      console.debug("Ratings already added to the page.");
      return;
    }

    var ratingsLine = document.createElement("ul");
    ratingsLine.classList.add("rating-container-details_rs");
    ratingsLine.classList.add("loader_rs");

    var metadataNode = detailsNode.querySelector("div[class^='detailV5__metadatas__left']");
    metadataNode.appendChild(ratingsLine);

    const titleNode = mediaNode.querySelector("h1#immersive-title");
    if (titleNode.innerText) {
      title = titleNode.innerText;
    } else if (titleNode.firstChild.nodeName == "IMG") {
      title = titleNode.firstChild.alt;
    } else {
      console.error("Cannot find the media title");
      return;
    }

    addRatings(ratingsLine, title, true);
  }
}

async function addRatings(container, title, forceNow = false, ignoreCache = false) {
  try {
    const ratings = await ratingQueue.getMovieRating(title, forceNow, ignoreCache);
    container.classList.remove("loader_rs");
    container.onclick = function () {
      reloadRatings(container, title);
    };
    getRatingsSource().forEach((ratingName) => {
      if (addRatingFunc[ratingName]) {
        if (ratings[ratingName]) {
          addRatingFunc[ratingName](container, ratings[ratingName]);
        } else {
          console.debug("Failed to find " + ratingName + " rating for " + title);
        }
      } else {
        console.error("Function to add " + ratingName + " rating not found for " + title);
      }
    });
  } catch (error) {
    console.error(error.message);
  }
}

async function reloadRatings(root, title) {
  root.onclick = null;
  root.innerHTML = "";
  root.classList.add("loader_rs");
  await addRatings(root, title, true, true);
  root.onclick = function () {
    reloadRatings(root, title);
  };
}

function addImdbRating(root, value) {
  if (!value) return;

  var icon = document.createElement("img");
  icon.classList.add("ic-rating_rs");
  icon.classList.add("ic-imdb_rs");
  icon.src = browser.runtime.getURL("icons/imdb.png");
  var val = document.createElement("span");
  val.classList.add("val-rating_rs");
  val.classList.add("val-imdb_rs");
  val.innerText = value;

  rating = document.createElement("li");
  rating.classList.add("rating_rs");
  rating.classList.add("imdb_rs");
  rating.appendChild(icon);
  rating.appendChild(val);

  root.appendChild(rating);
}

function addAlloCineRating(root, value) {
  if (!value) return;

  var icon = document.createElement("img");
  icon.classList.add("ic-rating_rs");
  icon.classList.add("ic-allocine_rs");
  icon.src = browser.runtime.getURL("icons/allocine.png");
  var val = document.createElement("span");
  val.classList.add("val-rating_rs");
  val.classList.add("val-allocine_rs");
  val.innerText = value;

  rating = document.createElement("li");
  rating.classList.add("rating_rs");
  rating.classList.add("allocine_rs");
  rating.appendChild(icon);
  rating.appendChild(val);

  root.appendChild(rating);
}

function addRottenTomatoesRating(root, value) {
  if (!value) return;

  var icon = document.createElement("img");
  icon.classList.add("ic-rating_rs");
  icon.classList.add("ic-rottentomatoes_rs");
  icon.src = browser.runtime.getURL("icons/rottentomatoes.png");
  var val = document.createElement("span");
  val.classList.add("val-rating_rs");
  val.classList.add("val-rottentomatoes_rs");
  val.innerText = value + "%";

  rating = document.createElement("li");
  rating.classList.add("rating_rs");
  rating.classList.add("rottentomatoes_rs");
  rating.appendChild(icon);
  rating.appendChild(val);

  root.appendChild(rating);
}
