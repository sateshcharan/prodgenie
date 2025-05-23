from fastapi import FastAPI, Request
from pydantic import BaseModel
import requests
from pdfParse import PdfService

app = FastAPI()

class PDFRequest(BaseModel):
    url: str

@app.post("/parse")
async def parse_pdf(data: PDFRequest):
    response = requests.get(data.url)
    if response.status_code != 200:
        return {"error": f"Failed to fetch PDF: {response.status_code}"}
    
    pdf_bytes = response.content
    tables = PdfService.extract_tables_from_pdf(pdf_bytes)
    text = PdfService.extract_text_from_pdf(pdf_bytes)

    return {
        "tables": tables,
        "text": text
    }
