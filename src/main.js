main();

async function main() {
  await getConfig();
  await addRatings(document);
  createDialogSubscription();
}
