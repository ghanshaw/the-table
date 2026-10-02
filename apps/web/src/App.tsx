import { useState } from "react";
import { useQuery, gql } from "@apollo/client";

const GET_ACTIONS = gql`
  query GetActions($type: ActionType, $limit: Int, $offset: Int) {
    executiveActions(type: $type, limit: $limit, offset: $offset) {
      id
      type
      title
      documentNumber
      signingDate
      publicationDate
      federalRegisterUrl
    }
  }
`;

type ActionType = "EXECUTIVE_ORDER" | "PROCLAMATION" | "MEMORANDUM" | null;

const TYPE_LABELS: Record<string, string> = {
  EXECUTIVE_ORDER: "Executive Order",
  PROCLAMATION: "Proclamation",
  MEMORANDUM: "Memorandum",
};

export default function App() {
  const [filter, setFilter] = useState<ActionType>(null);
  const { data, loading, error } = useQuery(GET_ACTIONS, {
    variables: { type: filter, limit: 50, offset: 0 },
  });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>The Table</h1>
      <p>Presidential Executive Actions</p>

      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <button onClick={() => setFilter(null)} style={{ fontWeight: !filter ? "bold" : "normal" }}>
          All
        </button>
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key as ActionType)}
            style={{ fontWeight: filter === key ? "bold" : "normal" }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "2px solid #333", padding: 8 }}>Date</th>
            <th style={{ textAlign: "left", borderBottom: "2px solid #333", padding: 8 }}>Type</th>
            <th style={{ textAlign: "left", borderBottom: "2px solid #333", padding: 8 }}>Title</th>
          </tr>
        </thead>
        <tbody>
          {data?.executiveActions.map((action: any) => (
            <tr key={action.id}>
              <td style={{ padding: 8, borderBottom: "1px solid #eee", whiteSpace: "nowrap" }}>
                {action.publicationDate}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #eee", whiteSpace: "nowrap" }}>
                {TYPE_LABELS[action.type]}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                <a href={action.federalRegisterUrl} target="_blank" rel="noopener noreferrer">
                  {action.title}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
