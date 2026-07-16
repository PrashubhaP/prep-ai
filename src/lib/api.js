/**
 * Client-side API helpers. Keep all fetch calls to our route handlers here so
 * components never hand-roll requests.
 */

/**
 * Read a File as a base64 string (without the `data:...;base64,` prefix).
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result || "";
      resolve(String(result).split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a resume PDF. The server extracts its text and generates interview
 * questions, so `file` is required.
 */
export async function uploadResume({ file, role, experienceLevel }) {
  const fileData = await fileToBase64(file);

  const res = await fetch("/api/resume/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      role,
      experienceLevel,
      fileData,
    }),
  });

  return res.json();
}

/**
 * Submit a completed interview for AI scoring. Returns { success, interviewId }.
 */
export async function submitInterview({ role, experienceLevel, questions, answers }) {
  const res = await fetch("/api/interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, experienceLevel, questions, answers }),
  });

  return res.json();
}
