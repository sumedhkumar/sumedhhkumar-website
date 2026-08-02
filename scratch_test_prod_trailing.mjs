async function test() {
  const res = await fetch("https://vyntegra.in/api/course-registrations/");
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Body:", text);
}
test();
