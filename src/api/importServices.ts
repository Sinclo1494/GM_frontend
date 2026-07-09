import axios from "axios";

const VALIDATE_URL = "http://127.0.0.1:8000/api/pointage-validate/";
const IMPORT_URL = "http://127.0.0.1:8000/api/pointage-import/";

function buildFormData(file: File, mapping: Record<number, string>,filiale:string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mapping", JSON.stringify(mapping));
  formData.append('filiale',filiale)

  return formData;
}

export async function validatePointage(
  file: File,
  mapping: Record<number, string>,
  filiale: string
) {
  const response = await axios.post(
    VALIDATE_URL,
    buildFormData(file, mapping,filiale),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

export async function importPointage(
  file: File,
  mapping: Record<number, string>,
  filiale: string
) {
  const response = await axios.post(
    IMPORT_URL,
    buildFormData(file, mapping,filiale),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}