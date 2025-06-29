main();

async function main() {
  await getConfig();
  await addMenuRatings(document);
 await addIndividualRatings(document);
 createDialogSubscription();
}
