export const typeDefs = `#graphql
  enum ActionType {
    EXECUTIVE_ORDER
    PROCLAMATION
    MEMORANDUM
  }

  type President {
    id: ID!
    name: String!
    party: String
    termStart: String!
    termEnd: String
    executiveActions(type: ActionType, limit: Int, offset: Int): [ExecutiveAction!]!
  }

  type ExecutiveAction {
    id: ID!
    president: President!
    type: ActionType!
    title: String!
    abstract: String
    documentNumber: String!
    signingDate: String
    publicationDate: String!
    federalRegisterUrl: String!
    pdfUrl: String
  }

  type Query {
    presidents: [President!]!
    president(id: ID!): President
    executiveActions(
      type: ActionType
      presidentId: ID
      limit: Int
      offset: Int
    ): [ExecutiveAction!]!
    executiveAction(id: ID!): ExecutiveAction
  }
`;
