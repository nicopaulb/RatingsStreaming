main();

async function main() {
  await getConfig();
  if(getThumbnailRating()) {
    await addMenuRatings(document);
  }
 await addIndividualRatings(document);
 createDialogSubscription();
}
