async function test() {
  const res = await fetch("https://vyntegra.in/");
  const html = await res.text();
  const match = html.match(/"buildId":"([^"]+)"/);
  console.log("Production Build ID:", match ? match[1] : "Not found");
}
test();
