import axios from "axios";
const API = import.meta.env.VITE_API_BASE_URL;

const POINTAGE_VALIDATE_URL = `${API}/pointage-validate/`;
const POINTAGE_IMPORT_URL = `${API}/pointage-import/`;

const GM_VALIDATE_URL = `${API}/gm-validate/`;
const GM_IMPORT_URL = `${API}/gm-import/`;

const MARQUE_VALIDATE_URL = `${API}/marque-validate/`;
const MARQUE_IMPORT_URL = `${API}/marque-import/`;

const TYPE_MARQUE_VALIDATE_URL = `${API}/type-marque-validate/`;
const TYPE_MARQUE_IMPORT_URL = `${API}/type-marque-import/`;

const SOUS_FAMILLE_VALIDATE_URL = `${API}/sous-famille-validate/`;
const SOUS_FAMILLE_IMPORT_URL = `${API}/sous-famille-import/`;

const SITUATION_AFFECTATION_VALIDATE_URL = `${API}/situation-affectation-validate/`;
const SITUATION_AFFECTATION_IMPORT_URL = `${API}/situation-affectation-import/`;

const SITE_VALIDATE_URL = `${API}/site-validate/`;
const SITE_IMPORT_URL = `${API}/site-import/`;

const REGULARISATION_GM_VALIDATE_URL = `${API}/regularisation-gm-validate/`;
const REGULARISATION_GM_IMPORT_URL = `${API}/regularisation-gm-import/`;

// ---------------------------------------------------------
// Validation FormData
// ---------------------------------------------------------

function buildValidationFormData(
  file: File,
  mapping: Record<number, string>,
  filiale: string,
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
  filiale: string,
) {
  const response = await axios.post(
    POINTAGE_VALIDATE_URL,
    buildValidationFormData(file, mapping, filiale),
  );

  return response.data;
}

// ---------------------------------------------------------
// Import already validated Pointage data
// ---------------------------------------------------------

export async function importPointage(validationId: string) {
  const response = await axios.post(POINTAGE_IMPORT_URL, {
    validation_id: validationId,
  });

  return response.data;
}

// ---------------------------------------------------------
// Validate Grand Materiel CSV
// ---------------------------------------------------------

export async function validateGM(
  file: File,
  mapping: Record<number, string>,
  filiale: string,
) {
  const response = await axios.post(
    GM_VALIDATE_URL,
    buildValidationFormData(file, mapping, filiale),
  );

  return response.data;
}

// ---------------------------------------------------------
// Import already validated Pointage data
// ---------------------------------------------------------

export async function importGM(validationId: string) {
  const response = await axios.post(GM_IMPORT_URL, {
    validation_id: validationId,
  });

  return response.data;
}

// ---------------------------------------------------------
// Validate Marque CSV
// ---------------------------------------------------------

export async function validateMarque(
  file: File,
  mapping: Record<number, string>,
  filiale: string,
) {
  const response = await axios.post(
    MARQUE_VALIDATE_URL,
    buildValidationFormData(file, mapping, filiale),
  );

  return response.data;
}

// ---------------------------------------------------------
// Import already validated Marque data
// ---------------------------------------------------------

export async function importMarque(validationId: string) {
  const response = await axios.post(MARQUE_IMPORT_URL, {
    validation_id: validationId,
  });

  return response.data;
}

// ---------------------------------------------------------
// Validate Type Marque CSV
// ---------------------------------------------------------

export async function validateTypeMarque(
  file: File,
  mapping: Record<number, string>,
  filiale: string,
) {
  const response = await axios.post(
    TYPE_MARQUE_VALIDATE_URL,
    buildValidationFormData(file, mapping, filiale),
  );

  return response.data;
}

// ---------------------------------------------------------
// Import already validated Type Marque data
// ---------------------------------------------------------

export async function importTypeMarque(validationId: string) {
  const response = await axios.post(TYPE_MARQUE_IMPORT_URL, {
    validation_id: validationId,
  });

  return response.data;
}

// ---------------------------------------------------------
// Validate Sous Famille CSV
// ---------------------------------------------------------

export async function validateSousFamille(
  file: File,
  mapping: Record<number, string>,
  filiale: string,
) {
  const response = await axios.post(
    SOUS_FAMILLE_VALIDATE_URL,
    buildValidationFormData(file, mapping, filiale),
  );

  return response.data;
}

// ---------------------------------------------------------
// Import already validated Sous Famille data
// ---------------------------------------------------------

export async function importSousFamille(validationId: string) {
  const response = await axios.post(SOUS_FAMILLE_IMPORT_URL, {
    validation_id: validationId,
  });

  return response.data;
}

// ---------------------------------------------------------
// Validate Situation / Affectation CSV
// ---------------------------------------------------------

export async function validateSituationAffectation(
  file: File,
  mapping: Record<number, string>,
  filiale: string,
) {
  const response = await axios.post(
    SITUATION_AFFECTATION_VALIDATE_URL,
    buildValidationFormData(file, mapping, filiale),
  );

  return response.data;
}

// ---------------------------------------------------------
// Import already validated Situation / Affectation data
// ---------------------------------------------------------

export async function importSituationAffectation(validationId: string) {
  const response = await axios.post(SITUATION_AFFECTATION_IMPORT_URL, {
    validation_id: validationId,
  });

  return response.data;
}

export async function validateSite(
  file: File,
  mapping: Record<number, string>,
  filiale: string,
) {
  const response = await axios.post(
    SITE_VALIDATE_URL,
    buildValidationFormData(file, mapping, filiale),
  );

  return response.data;
}

export async function importSite(validationId: string) {
  const response = await axios.post(SITE_IMPORT_URL, {
    validation_id: validationId,
  });

  return response.data;
}

export async function validateRegularisationGM(
  file: File,
  mapping: Record<number, string>,
  filiale: string,
) {
  const response = await axios.post(
    REGULARISATION_GM_VALIDATE_URL,
    buildValidationFormData(file, mapping, filiale),
  );

  return response.data;
}

export async function importRegularisationGM(validationId: string) {
  const response = await axios.post(REGULARISATION_GM_IMPORT_URL, {
    validation_id: validationId,
  });

  return response.data;
}
