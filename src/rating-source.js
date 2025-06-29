const fetchRatingFunc = [fetchYahooRating, fetchBingRating, fetchGoogleRating];

async function fetchAllRatings(ratingsSource, movie) {
  var ratings = {};

  if (!movie) {
    return ratings;
  }

  ratings = await getRatingsFromCache(movie);
  if (Object.keys(ratings).length != 0) {
    console.log(
      "Ratings found from cache for '" +
        movie +
        "' : " +
        JSON.stringify(ratings)
    );
    return ratings;
  }

  for (var key in fetchRatingFunc) {
    console.debug("Executing '" + fetchRatingFunc[key].name + "()' to get ratings from '" + ratingsSource + "'");
    Object.assign(ratings, await fetchRatingFunc[key](movie));
    if (ratingsSource.every((item) => ratings.hasOwnProperty(item))) {
      break;
    }
  }

  console.log(
    "Ratings fetched for '" + movie + "' : " + JSON.stringify(ratings)
  );
  await addRatingsToCache(movie, ratings);

  return ratings;
}

async function fetchYahooRating(movie) {
  const url = "https://search.yahoo.com/search?p=" + movie;
  const ratings = {};

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const responseString = await response.text();
    searchDoc = new DOMParser().parseFromString(responseString, "text/html");
    movieRatingsElem = searchDoc.querySelector(
      "div.grp-movie div.media-ratings"
    );

    if (!movieRatingsElem) {
      throw new Error(`Media ratings not found with Yahoo`);
    }

    imdbRating = movieRatingsElem.querySelector("li.imdb span.imdb");
    if (imdbRating) {
      rating = parseRating(imdbRating.innerText);
      if (rating) {
        ratings["IMDb"] = rating;
      }
    }

    rottenRating = movieRatingsElem.querySelector(
      "li.rottenTomatoes span.rottenTomatoes"
    );
    if (rottenRating) {
      rating = parseRating(rottenRating.innerText);
      if (rating) {
        ratings["RottenTomatoes"] = rating;
      }
    }
  } catch (error) {
    console.error(error.message);
  }

  return ratings;
}

async function fetchBingRating(movie) {
  const url = "https://www.bing.com/search?q=" + movie;
  const ratings = {};

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const responseString = await response.text();
    searchDoc = new DOMParser().parseFromString(responseString, "text/html");
    movieRatingsElem = searchDoc.querySelector("div.l_ecrd_ratings");

    if (!movieRatingsElem) {
      throw new Error(`Media ratings not found with Bing`);
    }

    imdbRating = movieRatingsElem.querySelector(
      "a.l_ecrd_txt_lnk[title='imdb.com'] div.l_ecrd_ratings_prim"
    );
    if (imdbRating) {
      rating = parseRating(imdbRating.innerText);
      if (rating) {
        ratings["IMDb"] = rating;
      }
    }

    rottenRating = movieRatingsElem.querySelector(
      "a.l_ecrd_txt_lnk[title='rottentomatoes.com'] div.l_ecrd_ratings_prim"
    );
    if (rottenRating) {
      rating = parseRating(rottenRating.innerText);
      if (rating) {
        ratings["RottenTomatoes"] = rating;
      }
    }

    allocineRating = movieRatingsElem.querySelector(
      "a.l_ecrd_txt_lnk[title='allocine.fr'] div.l_ecrd_ratings_prim"
    );
    if (allocineRating) {
      rating = parseRating(allocineRating.innerText);
      if (rating) {
        ratings["Allocine"] = rating;
      }
    }
  } catch (error) {
    console.error(error.message);
  }

  return ratings;
}

async function fetchGoogleRating(movie) {
  const url = "https://www.google.com/search?q=" + movie;
  const ratings = {};

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const responseString = await response.text();
    searchDoc = new DOMParser().parseFromString(responseString, "text/html");
    movieRatingsElem = searchDoc.querySelector(
      "div[data-attrid='kc:/film/film:reviews']"
    );
    if (!movieRatingsElem) {
      throw new Error(`Media ratings not found with Google`);
    }

    imdbRating = movieRatingsElem.querySelector(
      "a[href^='https://www.imdb.com/']"
    );
    if (imdbRating) {
      rating = parseRating(imdbRating.innerText);
      if (rating) {
        ratings["IMDb"] = rating;
      }
    }

    allocineRating = movieRatingsElem.querySelector(
      "a[href^='https://www.allocine.fr/']"
    );
    if (allocineRating) {
      rating = parseRating(allocineRating.innerText);
      if (rating) {
        ratings["Allocine"] = rating;
      }
    }
  } catch (error) {
    console.error(error.message);
  }

  return ratings;
}

function parseRating(ratingStr) {
  if (typeof ratingStr != "string") {
    return null;
  }

  // Remove % (RottenTomatoes ratings)
  ratingStr = ratingStr.replace("%", "");
  // Remove denominator (IMDb)
  ratingStr = ratingStr.split("/")[0];
  // Convert for float number
  ratingStr = ratingStr.replace(",", ".");

  return parseFloat(ratingStr);
}
