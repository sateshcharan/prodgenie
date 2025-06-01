import sys
import requests
import pdfplumber
import io
import json
import argparse

try:
    import camelot
except ImportError:
    camelot = None


class PdfService:

    @staticmethod
    def extract_tables_with_pdfplumber(pdf_bytes: bytes) -> list:
        all_tables = []
        table_settings = {
            "vertical_strategy": "lines",
            "horizontal_strategy": "lines",
            "intersection_tolerance": 5,
            "snap_tolerance": 3,
            "join_tolerance": 3,
            "edge_min_length": 3,
            "min_words_vertical": 1,
            "min_words_horizontal": 1,
        }

        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                # tables = page.extract_tables(table_settings=table_settings)
                tables = page.extract_tables()
                if tables:
                    all_tables.append(tables)
        return all_tables

    @staticmethod
    def extract_tables_with_camelot(pdf_path: str) -> list:
        if not camelot:
            raise ImportError("Camelot not installed. Try: pip install camelot-py[cv]")
        tables = camelot.read_pdf(pdf_path, pages="all", flavor="lattice")
        return [t.data for t in tables]

    @staticmethod
    def extract_text_with_pdfplumber(pdf_bytes: bytes) -> str:
        text = ""
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text


def main():
    parser = argparse.ArgumentParser(description="Parse a PDF")
    parser.add_argument("signed_url", help="Signed URL of the PDF file")

    args = parser.parse_args()

    response = requests.get(args.signed_url)
    if response.status_code != 200:
        print(f"Failed to download PDF: {response.status_code}", flush=True)
        sys.exit(1)

    pdf_bytes = response.content
    pdf_path = "/tmp/input.pdf"

    with open(pdf_path, "wb") as f:
        f.write(pdf_bytes)

    try:
        tables = PdfService.extract_tables_with_pdfplumber(pdf_bytes)
        text = PdfService.extract_text_with_pdfplumber(pdf_bytes)

    except Exception as e:
        print(json.dumps({"error": str(e)}), flush=True)
        sys.exit(1)


    print(json.dumps({"tables": tables, "text": text}, indent=2), flush=True)


if __name__ == "__main__":
    main()
