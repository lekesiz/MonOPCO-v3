import { describe, expect, it } from 'vitest';
import { searchBySiret, searchBySiren } from './pappers';

describe('Pappers API', () => {
  it('should validate API key by searching a known SIRET', async () => {
    // Google France SIRET: 44306184100047
    const result = await searchBySiret('44306184100047');

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    
    if (result.data) {
      expect(result.data.siren).toBe('443061841');
      expect(result.data.nom_entreprise).toContain('GOOGLE');
      expect(result.data.forme_juridique).toBeDefined();
      expect(result.data.siege).toBeDefined();
      expect(result.data.siege.ville).toBeDefined();
    }
  }, 10000); // 10s timeout for API call

  it('should return error for invalid SIRET format', async () => {
    const result = await searchBySiret('123'); // Too short

    expect(result.success).toBe(false);
    expect(result.error).toContain('14 chiffres');
  });

  it('should return error for non-existent SIRET', async () => {
    const result = await searchBySiret('00000000000000');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  }, 10000);

  it('should search by SIREN successfully', async () => {
    // Google France SIREN: 443061841
    const result = await searchBySiren('443061841');

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    
    if (result.data) {
      expect(result.data.siren).toBe('443061841');
      expect(result.data.nom_entreprise).toBeDefined();
    }
  }, 10000);

  it('should return error for invalid SIREN format', async () => {
    const result = await searchBySiren('12345'); // Too short

    expect(result.success).toBe(false);
    expect(result.error).toContain('9 chiffres');
  });
});
