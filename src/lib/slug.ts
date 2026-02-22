import { nanoid } from "nanoid";

export function generateSlug(name?: string | null): string {
  const id = nanoid(16);
  if (name) {
    const sanitized = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 20);
    return sanitized ? `${sanitized}-${id}` : id;
  }
  return id;
}

export function generateId(): string {
  return nanoid(21);
}
