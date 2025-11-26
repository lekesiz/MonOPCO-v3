import { describe, expect, it, beforeAll } from "vitest";
import { calculerEstimationOPCO, identifierOPCO, genererEmailPreInscription } from "./opco-estimation";

describe("OPCO Estimation System", () => {
  describe("identifierOPCO", () => {
    it("should identify AFDAS for culture/media sector (NAF 59)", () => {
      const opco = identifierOPCO("59.11");
      expect(opco).toBe("AFDAS");
    });

    it("should identify AKTO for service sector (NAF 78)", () => {
      const opco = identifierOPCO("78.10");
      expect(opco).toBe("AKTO");
    });

    it("should identify ATLAS for financial services (NAF 64)", () => {
      const opco = identifierOPCO("64.19");
      expect(opco).toBe("ATLAS");
    });

    it("should identify Constructys for construction (NAF 41)", () => {
      const opco = identifierOPCO("41.20");
      expect(opco).toBe("Constructys");
    });

    it("should identify OCAPIAT for agriculture (NAF 01)", () => {
      const opco = identifierOPCO("01.11");
      expect(opco).toBe("OCAPIAT");
    });

    it("should identify OPCO 2i for industry (NAF 25)", () => {
      const opco = identifierOPCO("25.11");
      expect(opco).toBe("OPCO 2i");
    });

    it("should identify OPCO Mobilités for automotive (NAF 45)", () => {
      const opco = identifierOPCO("45.11");
      expect(opco).toBe("OPCO Mobilités");
    });

    it("should identify OPCO Santé for health sector (NAF 86)", () => {
      const opco = identifierOPCO("86.10");
      expect(opco).toBe("OPCO Santé");
    });

    it("should identify OPCO EP for proximity businesses (NAF 56)", () => {
      const opco = identifierOPCO("56.10");
      expect(opco).toBe("OPCO EP");
    });

    it("should identify OPCO Santé for health and social services (NAF 88)", () => {
      const opco = identifierOPCO("88.10");
      expect(opco).toBe("OPCO Santé");
    });

    it("should identify OPCOMMERCE for commerce (NAF 47)", () => {
      const opco = identifierOPCO("47.11");
      expect(opco).toBe("OPCOMMERCE");
    });

    it("should default to OPCO EP for unknown NAF codes", () => {
      const opco = identifierOPCO("99.99");
      expect(opco).toBe("OPCO EP");
    });
  });

  describe("calculerEstimationOPCO", () => {
    it("should calculate estimation for small company (<11 employees)", async () => {
      // SIRET de test : Google France
      const siret = "44306184100047";
      const nombreEmployes = 5;

      const estimation = await calculerEstimationOPCO(siret, nombreEmployes);

      expect(estimation).toBeDefined();
      expect(estimation.siret).toBe(siret);
      expect(estimation.nombreEmployes).toBe(nombreEmployes);
      expect(estimation.nomEntreprise).toBe("GOOGLE FRANCE");
      expect(estimation.codeNaf).toBe("62.02A");
      expect(estimation.opcoIdentifie).toBe("OPCO EP"); // IT sector
      expect(estimation.masseSalarialeEstimee).toBe(175000); // 5 × 35000
      expect(estimation.tauxContribution).toBe(0.0055); // 0.55% for <11 employees
      expect(estimation.montantEstime).toBe(962.5); // 175000 × 0.0055
    });

    it("should calculate estimation for large company (>=11 employees)", async () => {
      const siret = "44306184100047";
      const nombreEmployes = 50;

      const estimation = await calculerEstimationOPCO(siret, nombreEmployes);

      expect(estimation).toBeDefined();
      expect(estimation.siret).toBe(siret);
      expect(estimation.nombreEmployes).toBe(nombreEmployes);
      expect(estimation.nomEntreprise).toBe("GOOGLE FRANCE");
      expect(estimation.masseSalarialeEstimee).toBe(1750000); // 50 × 35000
      expect(estimation.tauxContribution).toBe(0.01); // 1% for >=11 employees
      expect(estimation.montantEstime).toBe(17500); // 1750000 × 0.01
    });

    it("should throw error for invalid SIRET", async () => {
      const siret = "00000000000000";
      const nombreEmployes = 10;

      await expect(calculerEstimationOPCO(siret, nombreEmployes)).rejects.toThrow();
    });
  });

  describe("genererEmailPreInscription", () => {
    it("should generate pre-registration email with correct format", () => {
      const estimation = {
        siret: "44306184100047",
        nomEntreprise: "GOOGLE FRANCE",
        codeNaf: "62.02A",
        secteurActivite: "Programmation, conseil et autres activités informatiques",
        nombreEmployes: 50,
        masseSalarialeEstimee: 1750000,
        opcoIdentifie: "OPCO EP",
        montantEstime: 17500,
        tauxContribution: 0.01,
        detailsCalcul: {
          salaireMoyenAnnuel: 35000,
          tauxUtilise: 0.01,
          formule: "50 employés × 35000€ × 1.00% = 17500.00€",
        },
      };

      const email = genererEmailPreInscription(estimation);

      expect(email).toBeDefined();
      expect(email.subject).toContain("Pré-inscription OPCO");
      expect(email.subject).toContain("GOOGLE FRANCE");
      expect(email.subject).toContain("44306184100047");

      expect(email.body).toContain("GOOGLE FRANCE");
      expect(email.body).toContain("44306184100047");
      expect(email.body).toContain("62.02A");
      expect(email.body).toContain("50");
      expect(email.body).toContain("OPCO EP");
      // Vérifier que les montants sont présents (avec espace insécable)
      expect(email.body).toMatch(/1\s750\s000/);
      expect(email.body).toMatch(/17\s500/);
    });
  });
});
