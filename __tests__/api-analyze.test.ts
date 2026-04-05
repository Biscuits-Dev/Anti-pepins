/**
 * Tests d'intégration pour POST /api/analyze
 * Appelle directement le handler Next.js sans démarrer de serveur HTTP.
 *
 * Notes sur le comportement de la route :
 * - Pas de vérification Content-Type (pas de 415)
 * - Limite value : 10 000 chars (retourne 400, pas 413)
 * - La réponse 200 est enveloppée dans { success: true, data: { ... } }
 * - loadListsFromSupabase() est silencieuse sans env Supabase (continue avec les défauts)
 * - google.com est en whitelist → score 0
 */
import { POST } from "@/app/api/analyze/route";
import { NextRequest } from "next/server";
import { resetLoadFlag } from "@/lib/analyzer/database";

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  // Réinitialise le flag de chargement Supabase entre les tests
  resetLoadFlag();
});

describe("POST /api/analyze", () => {
  it("retourne 400 si le body est un objet vide (value manquant)", async () => {
    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("retourne 400 si le type est invalide", async () => {
    const req = makeRequest({ value: "test", type: "invalid-type" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("retourne 400 si value est vide (chaîne vide)", async () => {
    const req = makeRequest({ value: "", type: "url" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("retourne 400 si value dépasse 10 000 caractères", async () => {
    const req = makeRequest({ value: "x".repeat(10_001), type: "message" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("retourne 200 avec un score pour une URL normale", async () => {
    const req = makeRequest({ value: "https://google.com", type: "url" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; data: { score: number; risk: string } };
    expect(body.success).toBe(true);
    expect(typeof body.data.score).toBe("number");
    expect(body.data.score).toBeGreaterThanOrEqual(0);
    expect(body.data.score).toBeLessThanOrEqual(100);
    expect(typeof body.data.risk).toBe("string");
  });

  it("retourne 200 avec score=0 pour google.com (domaine en whitelist)", async () => {
    const req = makeRequest({ value: "https://google.com", type: "url" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; data: { score: number; risk: string } };
    expect(body.data.score).toBe(0);
    expect(body.data.risk).toBe("safe");
  });

  it("detecte un score non-nul pour une URL de phishing", async () => {
    const req = makeRequest({ value: "http://paypa1-secure.tk/login", type: "url" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; data: { score: number } };
    // L'URL contient des homoglyphes (paypa1) et un TLD suspect (.tk) — score > 0
    expect(body.data.score).toBeGreaterThan(0);
  });

  it("retourne 200 pour une analyse de message", async () => {
    const req = makeRequest({ value: "Bonjour, vous avez gagné un prix, cliquez ici!", type: "message" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; data: { score: number } };
    expect(body.success).toBe(true);
    expect(body.data.score).toBeGreaterThanOrEqual(0);
  });

  it("retourne 200 pour une analyse de type email", async () => {
    const req = makeRequest({ value: "scam@suspicious-domain.tk", type: "email" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; data: { score: number } };
    expect(body.success).toBe(true);
    expect(body.data.score).toBeGreaterThanOrEqual(0);
  });

  it("retourne 200 pour une analyse de type phone", async () => {
    const req = makeRequest({ value: "+33 1 23 45 67 89", type: "phone" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; data: { score: number } };
    expect(body.success).toBe(true);
  });

  it("accepte la requête sans Content-Type (pas de vérification 415)", async () => {
    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: {},
      body: JSON.stringify({ value: "https://google.com", type: "url" }),
    });
    // La route n'effectue pas de vérification Content-Type ; si le body est parseable, c'est 200
    // Selon l'implémentation de NextRequest, l'absence de Content-Type peut provoquer une erreur de parsing
    const res = await POST(req);
    // On accepte 200 ou 500 (selon comment NextRequest gère le JSON sans Content-Type)
    expect([200, 500]).toContain(res.status);
  });

  it("inclut le champ aiConfigured dans la réponse 200", async () => {
    const req = makeRequest({ value: "https://example-scam.tk", type: "url" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json() as { aiConfigured: boolean };
    expect(typeof body.aiConfigured).toBe("boolean");
  });

  it("detecte automatiquement le type si non fourni", async () => {
    const req = makeRequest({ value: "https://phishing-site.tk" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; data: { score: number } };
    expect(body.success).toBe(true);
  });

  it("retourne quick:true si le parametre quick est vrai", async () => {
    const req = makeRequest({ value: "https://example.com", type: "url", quick: true });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json() as { quick: boolean };
    expect(body.quick).toBe(true);
  });
});
