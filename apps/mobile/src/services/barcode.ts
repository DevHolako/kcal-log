import type { Food } from '@kcal-log/types';
import { api } from './api';

export class BarcodeService {
  /**
   * Validate barcode string according to standard formats (EAN-13, EAN-8, UPC-A, etc.)
   */
  public isValidBarcode(code: string): boolean {
    const clean = code.trim();
    // Must be numeric and between 8 and 14 digits
    return /^\d{8,14}$/.test(clean);
  }

  /**
   * Normalize barcode (strip leading zeros if 13-digit UPC-A representation or keep raw)
   */
  public normalizeBarcode(code: string): string {
    return code.trim();
  }

  /**
   * Lookup barcode via backend API (which implements the 3-tier OFF fallback chain:
   * authenticated OFF -> anonymous OFF -> local cache).
   */
  public async scanAndResolve(barcode: string): Promise<Food> {
    const cleanBarcode = this.normalizeBarcode(barcode);
    if (!this.isValidBarcode(cleanBarcode)) {
      throw new Error(`Invalid barcode format: ${barcode}. Expected 8-14 numeric digits.`);
    }

    return api.lookupBarcode(cleanBarcode);
  }
}

export const barcodeService = new BarcodeService();
