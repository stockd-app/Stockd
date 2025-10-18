import axios from "axios";
import { API_ROUTES } from "../config/consts";

/**
 * Upload a receipt image file to Backend for OCR processing.
 * @param file 
 * @returns 
 */
export const uploadReceipt = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(API_ROUTES.UPLOAD_RECEIPT, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};