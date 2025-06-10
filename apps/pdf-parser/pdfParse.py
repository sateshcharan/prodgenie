import sys
import requests
import pdfplumber
import io
import json
import argparse

from pdf2image import convert_from_path
import pytesseract
from PIL import Image
import io

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
            # "explicit_vertical_lines": [],
            # "explicit_horizontal_lines": [],
            # "snap_tolerance": 3,
            # "snap_x_tolerance": 3,
            # "snap_y_tolerance": 3,
            # "join_tolerance": 3,
            # "join_x_tolerance": 3,
            # "join_y_tolerance": 3,
            # "edge_min_length": 3,
            # "min_words_vertical": 3,
            # "min_words_horizontal": 1,
            # "intersection_tolerance": 3,
            # "intersection_x_tolerance": 3,
            # "intersection_y_tolerance": 3,
            # "text_tolerance": 3,
            # "text_x_tolerance": 3,
            # "text_y_tolerance": 3,
            # "text_*": 3,
        }

        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                # tables = page.extract_tables(table_settings=table_settings)
                tables = page.extract_tables(table_settings=table_settings)
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

    # @staticmethod
    # def extract_text_with_pytesseract(pdf_path: str) -> str:

    #     images = convert_from_path(pdf_path, dpi=300)

    #     # Run OCR on each page and collect results
    #     ocr_results = []
    #     for page_number, image in enumerate(images, start=1):
    #         text = pytesseract.image_to_string(image)
    #         ocr_results.append((page_number, text))

    #     ocr_results[:1]  # Show only first page OCR result for preview
    #     return ocr_results

    # @staticmethod
    # def extract_tables_with_pytesseract(pdf_path: str) -> List[str]:
    #     images = convert_from_path(pdf_path, dpi=300)

    #     # Extract "tables" from each page using OCR
    #     table_results = []
    #     custom_oem_psm_config = r"--oem 3 --psm 6"  # OCR Engine Mode + Assume a single uniform block of text

    #     for page_number, image in enumerate(images, start=1):
    #         # OCR to string
    #         raw_text = pytesseract.image_to_string(image, config=custom_oem_psm_config)
    #         # You can optionally add regex/filters here to isolate tabular-looking sections
    #         table_results.append((page_number, raw_text))

    #     return table_results


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
        # tables = PdfService.extract_tables_with_pytesseract(pdf_bytes)
        # text = PdfService.extract_text_with_pytesseract(pdf_path)

    except Exception as e:
        print(json.dumps({"error": str(e)}), flush=True)
        sys.exit(1)

    print(json.dumps({"tables": tables, "text": text}, indent=2), flush=True)


if __name__ == "__main__":
    main()
