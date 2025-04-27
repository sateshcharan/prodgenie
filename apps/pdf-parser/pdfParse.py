import sys
import requests
import pdfplumber
import io
import json

class PdfService:
    @staticmethod
    def extract_text_from_pdf(pdf_bytes: bytes) -> str:
        text = ""
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text

    @staticmethod
    def extract_tables_from_text(text: str) -> list:
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        tables = []
        current_table = []

        for line in lines:
            columns = [col for col in line.split('  ') if col]
            if len(columns) > 1:
                current_table.append(columns)
            elif current_table:
                tables.append(current_table)
                current_table = []

        if current_table:
            tables.append(current_table)

        return tables

    @staticmethod
    def parse_pdf_from_bytes(pdf_bytes: bytes) -> list:
        text = PdfService.extract_text_from_pdf(pdf_bytes)
        print(text)
        tables = PdfService.extract_tables_from_text(text)
        return tables

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
    result = PdfService.parse_pdf_from_bytes(pdf_bytes)

    # Print the extracted tables as JSON
    print(json.dumps(result), flush=True)

if __name__ == "__main__":
    main()
