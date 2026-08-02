async function test() {
  const res = await fetch("https://vyntegra.in/api/course-registrations", { redirect: "manual" });
  console.log("Status:", res.status);
  console.log("Headers:", Object.fromEntries(res.headers.entries()));
  if (res.status !== 301 && res.status !== 302) {
    const text = await res.text();
    console.log("Body:", text);
  }
}
test();
