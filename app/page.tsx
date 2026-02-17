import PdfViewer from "@/components/PdfViewer";

export default function Page() {
  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <div className="badge">
            <span>📞 +374 98 63 77 77</span>
            <span>📞 +374 77 63 77 77</span>
            <span>✉️ amv.light@mail.ru</span>
          </div>

          <div className="actions">
            <a className="btn" href="/AMV-LIGHT-PRICE-LIST.pdf" target="_blank" rel="noreferrer">
              Download PDF
            </a>
          </div>
        </div>
      </div>

      <div className="container">
        <PdfViewer fileUrl="/AMV-LIGHT-PRICE-LIST.pdf" />
        <div className="hint">
          Tip: This renders the original PDF pages (pixel-accurate). Use the Download button for the source file.
        </div>
      </div>
    </>
  );
}
