import { toast } from 'sonner';

// Copy a shareable in-app reference to the clipboard and confirm with a toast.
export async function shareReference(text: string, label = 'Link copied'): Promise<void> {
  const fallbackCopy = () => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  };

  let ok = false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      ok = true;
    } else {
      ok = fallbackCopy();
    }
  } catch {
    ok = fallbackCopy();
  }

  const title = ok ? label : 'Could not copy';
  const description = ok
    ? 'A shareable Tradio reference is on your clipboard.'
    : 'Copy is not available in this browser.';
  if (ok) toast.success(title, { description });
  else toast.error(title, { description });
}
