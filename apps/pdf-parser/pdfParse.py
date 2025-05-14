import sys
import requests
import pdfplumber
import io
import json

class PdfService:

    @staticmethod
    def extract_tables_from_pdf(pdf_bytes: bytes) -> list:
        all_tables = []
        table_settings = {
            "vertical_strategy": "lines",     # Use vertical lines to split columns
            "horizontal_strategy": "lines",   # Use horizontal lines to split rows
            "intersection_tolerance": 5,      # Tweak this if lines are slightly misaligned
            "snap_tolerance": 3,              # Helps with line detection noise
            "join_tolerance": 3,              # Merge close characters into one cell
            "edge_min_length": 3,             # Ignore tiny line segments
            "min_words_vertical": 1,
            "min_words_horizontal": 1,
            "keep_blank_chars": False
        }

        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                # tables = page.extract_tables(table_settings=table_settings)
                tables = page.extract_tables()
                if tables:
                    all_tables.extend(tables)
                    # all_tables.append(tables)
        return all_tables

    @staticmethod
    def extract_text_from_pdf(pdf_bytes: bytes) -> str:
        text = ""
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text

def main():
    if len(sys.argv) < 2:
        print("Usage: python pdfParse.py <signed_url>", flush=True)
        sys.exit(1)

    signed_url = sys.argv[1]
    response = requests.get(signed_url)

    if response.status_code != 200:
        print(f"Failed to download PDF: {response.status_code}", flush=True)
        sys.exit(1)

    pdf_bytes = response.content

    tables = PdfService.extract_tables_from_pdf(pdf_bytes)
    text = PdfService.extract_text_from_pdf(pdf_bytes)
    

    result = {
        "tables": tables,
        "text": text
    }

    # Print the result JSON
    print(json.dumps(result), flush=True)

if __name__ == "__main__":
    main()
