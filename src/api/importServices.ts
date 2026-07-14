import axios from "axios";


const VALIDATE_URL =
  "http://127.0.0.1:8000/api/pointage-validate/";

const IMPORT_URL =
  "http://127.0.0.1:8000/api/pointage-import/";


// ---------------------------------------------------------
// Validation FormData
// ---------------------------------------------------------

function buildValidationFormData(
  file: File,
  mapping: Record<number, string>,
  filiale: string
) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("mapping", JSON.stringify(mapping));
  formData.append("filiale", filiale);

  return formData;
}


// ---------------------------------------------------------
// Validate Pointage CSV
// ---------------------------------------------------------

export async function validatePointage(
  file: File,
  mapping: Record<number, string>,
  filiale: string
) {
  const response = await axios.post(
    VALIDATE_URL,
    buildValidationFormData(
      file,
      mapping,
      filiale
    )
  );

  return response.data;
}


// ---------------------------------------------------------
// Import already validated Pointage data
// ---------------------------------------------------------

export async function importPointage(
  validationId: string
) {
  const response = await axios.post(
    IMPORT_URL,
    {
      validation_id: validationId,
    }
  );

  return response.data;
}