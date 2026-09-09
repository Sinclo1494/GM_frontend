import { describe, it, expect } from 'vitest';
import {
  POINTAGE_EXPECTED_FIELDS,
  GM_EXPECTED_FIELDS,
  MARQUE_EXPECTED_FIELDS,
  TYPE_MARQUE_EXPECTED_FIELDS,
  SOUS_FAMILLE_EXPECTED_FIELDS,
  SITUATION_AFFECTATION_EXPECTED_FIELDS,
  SITE_EXPECTED_FIELDS,
  REGULARISATION_GM_EXPECTED_FIELDS,
} from '../../constants/expectedFields';

describe('constants/expectedFields', () => {
  const all = [
    POINTAGE_EXPECTED_FIELDS,
    GM_EXPECTED_FIELDS,
    MARQUE_EXPECTED_FIELDS,
    TYPE_MARQUE_EXPECTED_FIELDS,
    SOUS_FAMILLE_EXPECTED_FIELDS,
    SITUATION_AFFECTATION_EXPECTED_FIELDS,
    SITE_EXPECTED_FIELDS,
    REGULARISATION_GM_EXPECTED_FIELDS,
  ];

  it('all field lists are non-empty arrays', () => {
    all.forEach((list) => {
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);
    });
  });

  it('each field has value, label, and required', () => {
    all.forEach((list) => {
      list.forEach((field) => {
        expect(typeof field.value).toBe('string');
        expect(typeof field.label).toBe('string');
        expect(typeof field.required).toBe('boolean');
      });
    });
  });

  it('POINTAGE_EXPECTED_FIELDS contains required core fields', () => {
    const values = POINTAGE_EXPECTED_FIELDS.map((f) => f.value);
    expect(values).toContain('code_materiel');
    expect(values).toContain('code_site');
    expect(values).toContain('date_affectation');
  });

  it('GM_EXPECTED_FIELDS contains required core fields', () => {
    const values = GM_EXPECTED_FIELDS.map((f) => f.value);
    expect(values).toContain('code_materiel');
    expect(values).toContain('designation');
  });

  it('SITE_EXPECTED_FIELDS contains required core fields', () => {
    const values = SITE_EXPECTED_FIELDS.map((f) => f.value);
    expect(values).toContain('code_site');
    expect(values).toContain('libelle_site');
  });
});
