async function test() {
  console.log("Start");
  try {
    await Promise.reject(new Error("Original API error"))
      .then(async () => {
         console.log("Success");
      })
      .catch(async (err) => {
         console.log("Caught in chain:", err.message);
         // Simulate removeCartId
         await new Promise(r => setTimeout(r, 100));
         console.log("Finished removeCartId");
         throw new Error("medusaError throwing: " + err.message);
      });
    console.log("This should not run");
  } catch (e) {
    console.log("Caught in caller:", e.message);
  }
  console.log("End");
}
test();
