async function test() {
  const res = await fetch("https://vyntegra.in/");
  const html = await res.text();
  if (html.includes("6wZbxovrw7IcKmMJJxKhw")) {
    console.log("YES! The production server is running the newly built version.");
  } else {
    console.log("NO! The production server is running an OLD build.");
  }
}
test();
