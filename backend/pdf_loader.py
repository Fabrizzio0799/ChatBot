import PyPDF2

def load_pdf_text(pdf_path):
    try:
        with open(pdf_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page_num, page in enumerate(reader.pages):
                content = page.extract_text()
                if content:
                    text += content + "\n"
                else:
                    print(f"Advertencia: No se pudo extraer texto de la página {page_num}")
        if not text.strip():
            print("¡Advertencia! El PDF está vacío o no se pudo extraer texto.")
        return text
    except Exception as e:
        print(f"Error al cargar el PDF: {e}")
        return ""
