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
            if(getThumbnailRating()) {
              addMenuRatings(node);
            }
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}

async function addMenuRatings(strateNode) {
  var posters = strateNode.querySelectorAll("a[class^='contentRowTemplateItem']:not([href$='/'])");
  var timeout = 0;
  posters.forEach(async (poster) => {
    if (poster.querySelector("ul.rating-container-list_rs") != null) {
      console.debug("Ratings already added to the page.");
      return;
    }
    var ratingsColumn = document.createElement("ul");
    ratingsColumn.classList.add("rating-container-list_rs");

    var container = poster.querySelector("div.z-10");
    container.appendChild(ratingsColumn);

    var title = poster.querySelector("img[height='100%']").alt;
    if (title == "") {
      console.error("Cannot find the media title");
      return;
    }

    setTimeout(function() {
      addRatings(ratingsColumn, title);
    }, 1000 * timeout);
    timeout++;
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

    await addRatings(ratingsLine, title);
  }
}

async function addRatings(container, title) {
  const ratingsSource = getRatingsSource();
  const ratings = await fetchAllRatings(ratingsSource, title);

  ratingsSource.forEach((ratingName) => {
    if (addRatingFunc[ratingName]) {
      if (ratings[ratingName]) {
        console.debug("Adding " + ratingName + " rating to page for " + title);
        addRatingFunc[ratingName](container, ratings[ratingName]);
      } else {
        console.debug("Failed to find " + ratingName + " rating for " + title);
      }
    } else {
      console.error("Function to add " + ratingName + " rating not found for " + title);
    }
  });
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
