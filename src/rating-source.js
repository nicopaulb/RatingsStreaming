class RatingQueue {
  constructor() {
    this.queue = [];
    this.isDequeuing = false;
    this.ratingsSource = getRatingsSource();
    this.fetchRatingFunc = [this._fetchYahooRating, this._fetchBingRating, this._fetchGoogleRating];
  }

  async getMovieRating(movieName, forceNow = false, ignoreCache = false) {
    if (forceNow) {
      const index = this.queue.findIndex((item) => item.movieName === movieName);
      if (index > -1) {
        const existant = this.queue.splice(index, 1);
        this.queue.unshift(existant[0]);
        return existant[0].promise;
      }
    } else {
      const existant = this.queue.find((item) => item.movieName === movieName);
      if (existant) {
        return existant.promise;
      }
    }

    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    var ratings = ignoreCache ? null : await getRatingsFromCache(movieName);
    if (ratings != null) {
      console.log("Ratings found from cache for '" + movieName + "' : " + JSON.stringify(ratings));
      resolve(ratings);
    } else {
      if (forceNow) {
        this.queue.unshift({ movieName, resolve, reject, promise });
      } else {
        this.queue.push({ movieName, resolve, reject, promise });
      }
    }

    if (!this.isDequeuing) {
      this._execute();
    }
    return promise;
  }

  async _execute() {
    if (this.queue.length === 0) {
      this.isDequeuing = false;
      return;
    }

    this.isDequeuing = true;
    const { movieName, resolve, reject } = this.queue.shift();

    try {
      const result = await this._fetchAllRatings(movieName);
      resolve(result);
    } catch (error) {
      reject(error);
    }

    await new Promise((res) => setTimeout(res, getRequestDelay()));
    this._execute();
  }

  print() {
    console.log(
      "Queue:",
      this.queue.map((item) => item.value)
    );
  }

  async _fetchAllRatings(movieName) {
    if (!movieName) {
      throw new Error(`Movie name is undefined`);
    }

    var ratings = {};
    for (var key in this.fetchRatingFunc) {
      console.debug(
        "Executing '" + this.fetchRatingFunc[key].name + "()' to get ratings from '" + this.ratingsSource + "'"
      );
      Object.assign(ratings, await this.fetchRatingFunc[key](movieName));
      if (this.ratingsSource.every((item) => ratings.hasOwnProperty(item))) {
        break;
      }
    }

    console.log(
      "Ratings fetched for '" +
        movieName +
        "' : " +
        JSON.stringify(ratings) +
        " (" +
        this.queue.length +
        " movies in queue)"
    );
    await addRatingsToCache(movieName, ratings);

    return ratings;
  }

  async _fetchYahooRating(movie) {
    const url = "https://search.yahoo.com/search?p=" + movie;
    const ratings = {};

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const responseString = await response.text();
      const searchDoc = new DOMParser().parseFromString(responseString, "text/html");
      const movieRatingsElem = searchDoc.querySelector("div.grp-movie div.media-ratings");

      if (!movieRatingsElem) {
        throw new Error(`Media ratings not found with Yahoo`);
      }

      const imdbRating = movieRatingsElem.querySelector("li.imdb span.imdb");
      if (imdbRating) {
        const rating = parseRating(imdbRating.innerText);
        if (rating) {
          ratings["IMDb"] = rating;
        }
      }

      const rottenRating = movieRatingsElem.querySelector("li.rottenTomatoes span.rottenTomatoes");
      if (rottenRating) {
        const rating = parseRating(rottenRating.innerText);
        if (rating) {
          ratings["RottenTomatoes"] = rating;
        }
      }
    } catch (error) {
      console.debug(error.message);
    }

    return ratings;
  }

  async _fetchBingRating(movie) {
    const url = "https://www.bing.com/search?q=" + movie;
    const ratings = {};

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const responseString = await response.text();
      const searchDoc = new DOMParser().parseFromString(responseString, "text/html");
      const movieRatingsElem = searchDoc.querySelector("div.l_ecrd_ratings");

      if (!movieRatingsElem) {
        throw new Error(`Media ratings not found with Bing`);
      }

      const imdbRating = movieRatingsElem.querySelector("a.l_ecrd_txt_lnk[title='imdb.com'] div.l_ecrd_ratings_prim");
      if (imdbRating) {
        const rating = parseRating(imdbRating.innerText);
        if (rating) {
          ratings["IMDb"] = rating;
        }
      }

      const rottenRating = movieRatingsElem.querySelector(
        "a.l_ecrd_txt_lnk[title='rottentomatoes.com'] div.l_ecrd_ratings_prim"
      );
      if (rottenRating) {
        const rating = parseRating(rottenRating.innerText);
        if (rating) {
          ratings["RottenTomatoes"] = rating;
        }
      }

      const allocineRating = movieRatingsElem.querySelector(
        "a.l_ecrd_txt_lnk[title='allocine.fr'] div.l_ecrd_ratings_prim"
      );
      if (allocineRating) {
        const rating = parseRating(allocineRating.innerText);
        if (rating) {
          ratings["Allocine"] = rating;
        }
      }
    } catch (error) {
      console.debug(error.message);
    }

    return ratings;
  }

  async _fetchGoogleRating(movie) {
    const url = "https://www.google.com/search?q=" + movie;
    const ratings = {};

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const responseString = await response.text();
      const searchDoc = new DOMParser().parseFromString(responseString, "text/html");
      const movieRatingsElem = searchDoc.querySelector("div[data-attrid='kc:/film/film:reviews']");
      if (!movieRatingsElem) {
        throw new Error(`Media ratings not found with Google`);
      }

      const imdbRating = movieRatingsElem.querySelector("a[href^='https://www.imdb.com/']");
      if (imdbRating) {
        const rating = parseRating(imdbRating.innerText);
        if (rating) {
          ratings["IMDb"] = rating;
        }
      }

      const allocineRating = movieRatingsElem.querySelector("a[href^='https://www.allocine.fr/']");
      if (allocineRating) {
        const rating = parseRating(allocineRating.innerText);
        if (rating) {
          ratings["Allocine"] = rating;
        }
      }
    } catch (error) {
      console.debug(error.message);
    }

    return ratings;
  }
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

ratingQueue = new RatingQueue();
