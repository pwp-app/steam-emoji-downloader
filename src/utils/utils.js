export function buffer2blob(buffer, mime) {
  return new Blob([buffer], { type: mime });
}

export function downloadFromBlob(blob, fileName) {
  const a = document.createElement('a');
  a.download = fileName;
  a.href = URL.createObjectURL(blob);
  a.click();
}
