from fastapi import APIRouter, File, UploadFile, HTTPException
from app.asprise_api import send_receipt_to_asprise
from app.utils.receipt_parser import parse_asprise_response

router = APIRouter()

@router.get("/hello/{name}", tags=["Test"])
async def say_hello(name: str):
    return {"message": f"Hello {name} from Stockd!"}


@router.post("/upload-receipt", tags=["OCR"])
async def upload_receipt(file: UploadFile = File(...)):
    """
    Upload an image of a receipt and send it to Asprise OCR API
    """
    try:
        image_bytes = await file.read()

        # Send to Asprise API
        asprise_data = send_receipt_to_asprise(image_bytes, file.filename)
        parsed = parse_asprise_response(asprise_data)

        return {
            "status": "success",
            "response": parsed
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
