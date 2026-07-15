/**
 * Client-side API helpers. Keep all fetch calls to our route handlers here so
 * components never hand-roll requests.
 */

export async function uploadResume({ fileName, role, experienceLevel }) {
  const res = await fetch("/api/resume/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName, role, experienceLevel }),
  });

  return res.json();
}
