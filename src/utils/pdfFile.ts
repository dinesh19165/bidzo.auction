export function savePdfBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export function printPdfBlobInWindow(printWindow: Window, blob: Blob): void {
  const objectUrl = URL.createObjectURL(blob);
  printWindow.addEventListener('load', () => {
    window.setTimeout(() => {
      if (!printWindow.closed) {
        printWindow.focus();
        printWindow.print();
      }
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    }, 750);
  }, { once: true });
  printWindow.location.href = objectUrl;
}

export async function runWithPdfActionLock(
  lock: { current: boolean },
  action: () => Promise<void>,
): Promise<void> {
  if (lock.current) return;
  lock.current = true;
  try {
    await action();
  } finally {
    lock.current = false;
  }
}
