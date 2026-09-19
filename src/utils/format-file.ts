export const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";

  const kb = bytes / 1024;

  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;

  return `${(kb / 1024).toFixed(1)} MB`;
};
