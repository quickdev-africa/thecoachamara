// Simple in-memory store for debug submissions. Not persisted. Not for production.

type Submission = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  createdAt: string;
};

const MAX_STORE = 50;
const store: Submission[] = [];

export function addSubmission(payload: { name?: string; email?: string; phone?: string; message?: string }) {
  const s: Submission = { ...payload, createdAt: new Date().toISOString() };
  store.unshift(s);
  if (store.length > MAX_STORE) store.pop();
}

export function getSubmissions() {
  return store.slice();
}
