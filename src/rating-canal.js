main();

async function main() {
    await addRatings(document);
    createDialogSubscription();
}

async function createDialogSubscription() {
    const targetNode = document.getElementById("application-main-content");
    const config = {childList: true,  subtree: true};
    const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
        if (mutation.type === "childList") {
            for (const node of mutation.addedNodes) { 
                if(node.classList.contains("detailV5___x5p_B")) {
                    addRatings(node);
                }
                else if(node.nodeName == "DIALOG") {
                    addRatings(node);
                }
            }
        }
    }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
}

async function addRatings(mediaNode) {
    var reviewNode = mediaNode.querySelector("ul[class^='Reviews']");
    if(reviewNode) {
        if(isRatingAlreadyAdded(mediaNode)) {
            console.error("Ratings already added to the page.")
            return;
        }

        var ratingsLine = document.createElement("ul");
        ratingsLine.classList.add("rating-line");
        reviewNode.parentNode.appendChild(ratingsLine);
    
        const title = getTitle(mediaNode);
        ratings = await fetchAll(["Allocine", "IMDb", "RottenTomatoes"], title);
    
        addImdbRating(ratingsLine, ratings["IMDb"]);
        addRottenTomatoesRating(ratingsLine, ratings["RottenTomatoes"]);
        addAlloCineRating(ratingsLine, ratings["Allocine"]);
    }
}

function isRatingAlreadyAdded(mediaNode) {
    return mediaNode.querySelector("ul.rating-line") != null;
}

function getTitle(mediaNode) {
    const titleNode = mediaNode.querySelector("h1#immersive-title");
    if(titleNode.innerText) {
        return titleNode.innerText;
    }
    if(titleNode.firstChild.nodeName == "IMG") {
        return titleNode.firstChild.alt;
    }
    console.error("Cannot find the media title");
}

function addImdbRating(root, value) {
    if(!value) return;

    var icon = document.createElement("img");
    icon.classList.add("ic-rating");
    icon.classList.add("ic-imdb");
    icon.src = browser.runtime.getURL("icons/imdb.png");
    var val = document.createElement("span");
    val.classList.add("val-rating");
    val.classList.add("val-imdb");
    val.innerText = value + " / 10";

    rating = document.createElement("li");
    rating.classList.add('rating');
    rating.classList.add('imdb');
    rating.appendChild(icon);
    rating.appendChild(val);

    root.appendChild(rating);
}

function addAlloCineRating(root, value) {
    if(!value) return;

    var icon = document.createElement("img");
    icon.classList.add("ic-rating");
    icon.classList.add("ic-allocine");
    icon.src = browser.runtime.getURL("icons/allocine.png");
    var val = document.createElement("span");
    val.classList.add("val-rating");
    val.classList.add("val-allocine");
    val.innerText = value + " / 5";

    rating = document.createElement("li");
    rating.classList.add('rating');
    rating.classList.add('allocine');
    rating.appendChild(icon);
    rating.appendChild(val);
    
    root.appendChild(rating);
}

function addRottenTomatoesRating(root, value) {
    if(!value) return;

    var icon = document.createElement("img");
    icon.classList.add("ic-rating");
    icon.classList.add("ic-rottentomatoes");
    icon.src = browser.runtime.getURL("icons/rottentomatoes.png");
    var val = document.createElement("span");
    val.classList.add("val-rating");
    val.classList.add("val-rottentomatoes");
    val.innerText = value + " %";

    rating = document.createElement("li");
    rating.classList.add('rating');
    rating.classList.add('rottentomatoes');
    rating.appendChild(icon);
    rating.appendChild(val);
    
    root.appendChild(rating);
}