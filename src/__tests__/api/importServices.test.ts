import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  validatePointage,
  importPointage,
  validateGM,
  importGM,
  validateMarque,
  importMarque,
  validateTypeMarque,
  importTypeMarque,
  validateSousFamille,
  importSousFamille,
  validateSituationAffectation,
  importSituationAffectation,
  validateSite,
  importSite,
  validateRegularisationGM,
  importRegularisationGM,
} from '../../api/importServices';

vi.mock('axios');

const mockAxios = axios as unknown as ReturnType<typeof vi.fn>;

describe('api/importServices', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
  });

  it('validatePointage posts FormData to correct URL', async () => {
    const file = new File(['a,b,c'], 'x.csv', { type: 'text/csv' });
    mockAxios.mockResolvedValue({ data: { ok: true } });

    const result = await validatePointage(file, { 0: 'code' }, 'F1');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/pointage-validate/',
        method: 'post',
        data: expect.any(FormData),
      })
    );
    expect(result).toEqual({ ok: true });
  });

  it('importPointage posts validation_id', async () => {
    mockAxios.mockResolvedValue({ data: { imported: 1 } });

    const result = await importPointage('val-1');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/pointage-import/',
        method: 'post',
        data: { validation_id: 'val-1' },
      })
    );
    expect(result).toEqual({ imported: 1 });
  });

  it('validateGM posts to gm-validate URL', async () => {
    const file = new File(['a,b,c'], 'x.csv', { type: 'text/csv' });
    mockAxios.mockResolvedValue({ data: { ok: true } });

    await validateGM(file, { 0: 'code' }, 'F1');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/gm-validate/',
        method: 'post',
      })
    );
  });

  it('importGM posts to gm-import URL', async () => {
    mockAxios.mockResolvedValue({ data: { imported: 2 } });

    const result = await importGM('val-1');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/gm-import/',
        method: 'post',
        data: { validation_id: 'val-1' },
      })
    );
    expect(result).toEqual({ imported: 2 });
  });

  it('validateMarque posts to marque-validate URL', async () => {
    const file = new File(['a,b,c'], 'x.csv', { type: 'text/csv' });
    mockAxios.mockResolvedValue({ data: { ok: true } });

    await validateMarque(file, { 0: 'code' }, 'F1');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/marque-validate/',
        method: 'post',
      })
    );
  });

  it('importMarque posts to marque-import URL', async () => {
    mockAxios.mockResolvedValue({ data: {} });

    await importMarque('val-1');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/marque-import/',
        method: 'post',
        data: { validation_id: 'val-1' },
      })
    );
  });

  it('validateTypeMarque posts to type-marque-validate URL', async () => {
    const file = new File(['a,b,c'], 'x.csv', { type: 'text/csv' });
    mockAxios.mockResolvedValue({ data: {} });

    await validateTypeMarque(file, { 0: 'code' }, 'F1');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/type-marque-validate/',
        method: 'post',
      })
    );
  });

  it('importTypeMarque posts to type-marque-import URL', async () => {
    mockAxios.mockResolvedValue({ data: {} });

    await importTypeMarque('val-1');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/type-marque-import/',
        method: 'post',
        data: { validation_id: 'val-1' },
      })
    );
  });

  it('validateSousFamille posts to sous-famille-validate URL', async () => {
    const file = new File(['a,b,c'], 'x.csv', { type: 'text/csv' });
    mockAxios.mockResolvedValue({ data: {} });

    await validateSousFamille(file, { 0: 'code' }, 'F1');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/sous-famille-validate/',
        method: 'post',
      })
    );
  });

  it('importSousFamille posts to sous-famille-import URL', async () => {
    mockAxios.mockResolvedValue({ data: {} });

    await importSousFamille('val-1');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/sous-famille-import/',
        method: 'post',
        data: { validation_id: 'val-1' },
      })
    );
  });

  it('validateSituationAffectation posts to situation-affectation-validate URL', async () => {
    const file = new File(['a,b,c'], 'x.csv', { type: 'text/csv' });
    mockAxios.mockResolvedValue({ data: {} });

    await validateSituationAffectation(file, { 0: 'code' }, 'F1');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/situation-affectation-validate/',
        method: 'post',
      })
    );
  });

  it('importSituationAffectation posts to situation-affectation-import URL', async () => {
    mockAxios.mockResolvedValue({ data: {} });

    await importSituationAffectation('val-1');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/situation-affectation-import/',
        method: 'post',
        data: { validation_id: 'val-1' },
      })
    );
  });

  it('validateSite posts to site-validate URL', async () => {
    const file = new File(['a,b,c'], 'x.csv', { type: 'text/csv' });
    mockAxios.mockResolvedValue({ data: {} });

    await validateSite(file, { 0: 'code' }, 'F1');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/site-validate/',
        method: 'post',
      })
    );
  });

  it('importSite posts to site-import URL', async () => {
    mockAxios.mockResolvedValue({ data: {} });

    await importSite('val-1');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/site-import/',
        method: 'post',
        data: { validation_id: 'val-1' },
      })
    );
  });

  it('validateRegularisationGM posts to regularisation-gm-validate URL', async () => {
    const file = new File(['a,b,c'], 'x.csv', { type: 'text/csv' });
    mockAxios.mockResolvedValue({ data: {} });

    await validateRegularisationGM(file, { 0: 'code' }, 'F1');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/regularisation-gm-validate/',
        method: 'post',
      })
    );
  });

  it('importRegularisationGM posts to regularisation-gm-import URL', async () => {
    mockAxios.mockResolvedValue({ data: {} });

    await importRegularisationGM('val-1');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/regularisation-gm-import/',
        method: 'post',
        data: { validation_id: 'val-1' },
      })
    );
  });
});
