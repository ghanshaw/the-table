import { supabase } from "./supabase.js";

const FEDERAL_REGISTER_API = "https://www.federalregister.gov/api/v1/documents.json";

const DOC_TYPES = [
  "executive_order",
  "proclamation",
  "presidential_memorandum",
] as const;

const TYPE_MAP: Record<string, string> = {
  executive_order: "executive_order",
  proclamation: "proclamation",
  presidential_memorandum: "memorandum",
};

interface FederalRegisterDoc {
  document_number: string;
  title: string;
  abstract: string | null;
  type: string;
  subtype: string | null;
  presidential_document_type_id: number;
  signing_date: string | null;
  publication_date: string;
  html_url: string;
  pdf_url: string | null;
}

interface FederalRegisterResponse {
  count: number;
  results: FederalRegisterDoc[];
  next_page_url: string | null;
}

async function ensurePresident(): Promise<string> {
  const { data: existing } = await supabase
    .from("presidents")
    .select("id")
    .eq("name", "Donald Trump")
    .single();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("presidents")
    .insert({
      name: "Donald Trump",
      party: "Republican",
      term_start: "2025-01-20",
    })
    .select("id")
    .single();

  if (error) throw error;
  return data!.id;
}

async function fetchPage(url: string): Promise<FederalRegisterResponse> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Federal Register API error: ${res.status}`);
  return res.json() as Promise<FederalRegisterResponse>;
}

async function ingestDocType(presidentId: string, docType: string) {
  const params = new URLSearchParams({
    "conditions[presidential_document_type]": docType,
    "conditions[president]": "donald-trump",
    "conditions[signing_date][gte]": "2025-01-20",
    per_page: "100",
    order: "newest",
  });

  let url: string | null = `${FEDERAL_REGISTER_API}?${params}`;
  let total = 0;

  while (url) {
    const page = await fetchPage(url);

    const rows = page.results.map((doc) => ({
      president_id: presidentId,
      type: TYPE_MAP[docType],
      title: doc.title,
      abstract: doc.abstract,
      document_number: doc.document_number,
      signing_date: doc.signing_date,
      publication_date: doc.publication_date,
      federal_register_url: doc.html_url,
      pdf_url: doc.pdf_url,
    }));

    if (rows.length > 0) {
      const { error } = await supabase
        .from("executive_actions")
        .upsert(rows, { onConflict: "document_number" });
      if (error) throw error;
    }

    total += rows.length;
    url = page.next_page_url ?? null;
  }

  return total;
}

async function main() {
  console.log("Starting ingestion...");
  const presidentId = await ensurePresident();

  for (const docType of DOC_TYPES) {
    const count = await ingestDocType(presidentId, docType);
    console.log(`  ${docType}: ${count} documents`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
