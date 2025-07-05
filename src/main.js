main();

async function main() {
  await getConfig();
  if (getThumbnailRating()) {
    addMenuRatings(document);
  }
  addIndividualRatings(document);
  createDialogSubscription();
}

// Overriding log functions for production
// console.log = function () {};
// console.debug = function () {};
