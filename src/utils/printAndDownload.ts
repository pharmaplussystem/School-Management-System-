// Robust Utility for Printing and Downloading across all browser environments

/**
 * Downloads a structured CSV file with UTF-8 BOM encoding for proper Excel and Sheets display.
 */
export function downloadCSV(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) {
  const sanitize = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(sanitize).join(',');
  const dataRows = rows.map((r) => r.map(sanitize).join(','));
  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Downloads a raw text, JSON, or Blob file directly to the user's computer.
 */
export function downloadFile(
  filename: string,
  content: string | Blob,
  mimeType: string = 'text/plain;charset=utf-8;'
) {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Cleanly prints an HTML element by ID or direct HTML content.
 * Handles iframe sandboxing, Tailwind styling, and standard window.print fallbacks.
 */
export function printContent(elementIdOrHtml: string, title: string = 'Print Document') {
  // Find element by ID or check if it's already an HTML string
  let html = '';
  const element = document.getElementById(elementIdOrHtml);
  if (element) {
    html = element.innerHTML;
  } else {
    html = elementIdOrHtml;
  }

  // Get current stylesheet links and styles to preserve Tailwind and fonts
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((el) => el.outerHTML)
    .join('\n');

  // Try creating an isolated hidden iframe
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${title}</title>
            ${styles}
            <style>
              @page {
                size: A4;
                margin: 12mm 15mm;
              }
              body {
                background: white !important;
                color: #0f172a !important;
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
                padding: 10px;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .print\\:hidden, button, [role="button"], input[type="button"], nav {
                display: none !important;
              }
            </style>
          </head>
          <body>
            <div class="printable-area">
              ${html}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.focus();
                  window.print();
                  setTimeout(function() {
                    window.parent.postMessage('print-complete', '*');
                  }, 500);
                }, 250);
              };
            </script>
          </body>
        </html>
      `);
      doc.close();

      const cleanup = () => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      };

      window.addEventListener('message', function onMessage(e) {
        if (e.data === 'print-complete') {
          window.removeEventListener('message', onMessage);
          cleanup();
        }
      });

      // Fallback cleanup
      setTimeout(cleanup, 60000);
      return;
    }
  } catch {
    // If iframe method fails due to restrictive sandbox, use standard window.print
  }

  // Fallback: standard window.print()
  window.print();
}
