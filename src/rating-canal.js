async function createDialogSubscription() {
  const targetNode = document.getElementById("application-main-content");
  const config = { childList: true, subtree: true };
  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (node.classList.contains("detailV5___x5p_B")) {
            addRatings(node);
          } else if (node.nodeName == "DIALOG") {
            addRatings(node);
          }
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}

const addRatingFunc = {
  IMDb: addImdbRating,
  RottenTomatoes: addRottenTomatoesRating,
  Allocine: addAlloCineRating,
};

async function addRatings(mediaNode) {
  var detailsNode = mediaNode.querySelector(
    "div[class^='detailV5__informations']"
  );

  if (detailsNode) {
    // Media details shown
    if (isRatingAlreadyAdded(mediaNode)) {
      console.error("Ratings already added to the page.");
      return;
    }

    var ratingsLine = document.createElement("ul");
    ratingsLine.classList.add("rating-line_rs");

    var metadataNode = detailsNode.querySelector("div[class^='detailV5__metadatas__left']");
    metadataNode.appendChild(ratingsLine);

    const title = getTitle(mediaNode);
    const ratingsSource = getRatingsSource();
    const ratings = await fetchAllRatings(ratingsSource, title);

    ratingsSource.forEach((ratingName) => {
      if (addRatingFunc[ratingName]) {
        console.debug("Adding " + ratingName + " rating to page");
        addRatingFunc[ratingName](ratingsLine, ratings[ratingName]);
      } else {
        console.error("Function to add " + ratingName + " rating not found");
      }
    });
  }
}

function isRatingAlreadyAdded(mediaNode) {
  return mediaNode.querySelector("ul.rating-line_rs") != null;
}

function getTitle(mediaNode) {
  const titleNode = mediaNode.querySelector("h1#immersive-title");
  if (titleNode.innerText) {
    return titleNode.innerText;
  }
  if (titleNode.firstChild.nodeName == "IMG") {
    return titleNode.firstChild.alt;
  }
  console.error("Cannot find the media title");
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
  val.innerText = value + " / 10";

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
  val.innerText = value + " / 5";

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
  val.innerText = value + " %";

  rating = document.createElement("li");
  rating.classList.add("rating_rs");
  rating.classList.add("rottentomatoes_rs");
  rating.appendChild(icon);
  rating.appendChild(val);

  root.appendChild(rating);
}
