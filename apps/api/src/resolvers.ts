import { supabase } from "./supabase.js";

const ACTION_TYPE_MAP: Record<string, string> = {
  EXECUTIVE_ORDER: "executive_order",
  PROCLAMATION: "proclamation",
  MEMORANDUM: "memorandum",
};

const ACTION_TYPE_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(ACTION_TYPE_MAP).map(([k, v]) => [v, k])
);

function formatAction(row: any) {
  return {
    id: row.id,
    type: ACTION_TYPE_REVERSE[row.type],
    title: row.title,
    abstract: row.abstract,
    documentNumber: row.document_number,
    signingDate: row.signing_date,
    publicationDate: row.publication_date,
    federalRegisterUrl: row.federal_register_url,
    pdfUrl: row.pdf_url,
    presidentId: row.president_id,
  };
}

function formatPresident(row: any) {
  return {
    id: row.id,
    name: row.name,
    party: row.party,
    termStart: row.term_start,
    termEnd: row.term_end,
  };
}

export const resolvers = {
  Query: {
    async presidents() {
      const { data, error } = await supabase.from("presidents").select("*");
      if (error) throw error;
      return data.map(formatPresident);
    },

    async president(_: any, { id }: { id: string }) {
      const { data, error } = await supabase
        .from("presidents")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return formatPresident(data);
    },

    async executiveActions(
      _: any,
      {
        type,
        presidentId,
        limit = 50,
        offset = 0,
      }: { type?: string; presidentId?: string; limit?: number; offset?: number }
    ) {
      let query = supabase
        .from("executive_actions")
        .select("*")
        .order("publication_date", { ascending: false })
        .range(offset, offset + limit - 1);

      if (type) query = query.eq("type", ACTION_TYPE_MAP[type]);
      if (presidentId) query = query.eq("president_id", presidentId);

      const { data, error } = await query;
      if (error) throw error;
      return data.map(formatAction);
    },

    async executiveAction(_: any, { id }: { id: string }) {
      const { data, error } = await supabase
        .from("executive_actions")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return formatAction(data);
    },
  },

  President: {
    async executiveActions(
      parent: any,
      { type, limit = 50, offset = 0 }: { type?: string; limit?: number; offset?: number }
    ) {
      let query = supabase
        .from("executive_actions")
        .select("*")
        .eq("president_id", parent.id)
        .order("publication_date", { ascending: false })
        .range(offset, offset + limit - 1);

      if (type) query = query.eq("type", ACTION_TYPE_MAP[type]);

      const { data, error } = await query;
      if (error) throw error;
      return data.map(formatAction);
    },
  },

  ExecutiveAction: {
    async president(parent: any) {
      const { data, error } = await supabase
        .from("presidents")
        .select("*")
        .eq("id", parent.presidentId)
        .single();
      if (error) throw error;
      return formatPresident(data);
    },
  },
};
