import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import { BarcodeService } from '../services/barcode';
import { api } from '../services/api';

describe('Barcode Scanning & Resolution Service', () => {
  let service: BarcodeService;

  beforeEach(() => {
    service = new BarcodeService();
    vi.restoreAllMocks();
  });

  it('validates barcode numeric formats according to standard specifications', () => {
    // EAN-13
    expect(service.isValidBarcode('3017620422003')).toBe(true);
    // EAN-8
    expect(service.isValidBarcode('12345678')).toBe(true);
    // UPC-A (12 digits)
    expect(service.isValidBarcode('012345678905')).toBe(true);

    // Invalid non-numeric or bad lengths
    expect(service.isValidBarcode('ABC-123456')).toBe(false);
    expect(service.isValidBarcode('123')).toBe(false); // too short
    expect(service.isValidBarcode('12345678901234567')).toBe(false); // too long
  });

  it('trims whitespace on normalize', () => {
    expect(service.normalizeBarcode('  3017620422003 \n')).toBe('3017620422003');
  });

  it('queries API lookupBarcode and returns matched food', async () => {
    const fakeFood = {
      id: 99,
      name: 'Nutella Hazelnut Spread',
      brand: 'Ferrero',
      barcode: '3017620422003',
      isCustom: false,
      caloriesPer100g: 539,
      proteinPer100g: 6.3,
      carbsPer100g: 57.5,
      fatPer100g: 30.9,
      servings: [],
    };

    const lookupSpy = vi.spyOn(api, 'lookupBarcode').mockResolvedValue(fakeFood);

    const result = await service.scanAndResolve('3017620422003');
    expect(lookupSpy).toHaveBeenCalledWith('3017620422003');
    expect(result.name).toBe('Nutella Hazelnut Spread');
    expect(result.caloriesPer100g).toBe(539);
  });

  it('throws descriptive error on invalid barcode attempt', async () => {
    await expect(service.scanAndResolve('invalid-code')).rejects.toThrow(
      /Invalid barcode format/
    );
  });
});
