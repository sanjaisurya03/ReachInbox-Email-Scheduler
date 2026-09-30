import elasticsearch, {
  EMAIL_INDEX,
} from "../config/elasticsearch.js";

interface EmailDocument {
  id: string;
  campaignId: string;
  senderId: string;
  recipient: string;
  subject: string;
  body: string;
  status: string;
  scheduledAt: Date;
  sentAt?: Date | null;
  messageId?: string | null;
  createdAt: Date;
  updatedAt?: Date;
  errorMessage?: string | null;
  bullmqJobId?: string | null;
}

export async function initializeEmailIndex(): Promise<void> {
  try {
    const exists = await elasticsearch.indices.exists({
      index: EMAIL_INDEX,
    });

    if (!exists) {
      await elasticsearch.indices.create({
        index: EMAIL_INDEX,
        mappings: {
          properties: {
            id: {
              type: "keyword",
            },
            campaignId: {
              type: "keyword",
            },
            senderId: {
              type: "keyword",
            },
            recipient: {
              type: "text",
              fields: {
                keyword: {
                  type: "keyword",
                },
              },
            },
            subject: {
              type: "text",
              fields: {
                keyword: {
                  type: "keyword",
                },
              },
            },
            body: {
              type: "text",
            },
            status: {
              type: "keyword",
            },
            scheduledAt: {
              type: "date",
            },
            sentAt: {
              type: "date",
            },
            messageId: {
              type: "keyword",
            },
            bullmqJobId: {
              type: "keyword",
            },
            errorMessage: {
              type: "text",
            },
            createdAt: {
              type: "date",
            },
            updatedAt: {
              type: "date",
            },
          },
        },
      });

      console.log(
        `Elasticsearch index "${EMAIL_INDEX}" created successfully`
      );
    } else {
      console.log(
        `Elasticsearch index "${EMAIL_INDEX}" already exists`
      );
    }
  } catch (error) {
    console.error(
      "Elasticsearch index initialization failed:",
      error
    );
  }
}

export async function indexEmail(
  email: EmailDocument
): Promise<void> {
  try {
    await elasticsearch.index({
      index: EMAIL_INDEX,
      id: email.id,
      document: {
        id: email.id,
        campaignId: email.campaignId,
        senderId: email.senderId,
        recipient: email.recipient,
        subject: email.subject,
        body: email.body,
        status: email.status,
        scheduledAt: email.scheduledAt.toISOString(),
        sentAt: email.sentAt
          ? email.sentAt.toISOString()
          : null,
        messageId: email.messageId ?? null,
        bullmqJobId: email.bullmqJobId ?? null,
        errorMessage: email.errorMessage ?? null,
        createdAt: email.createdAt.toISOString(),
        updatedAt: email.updatedAt
          ? email.updatedAt.toISOString()
          : null,
      },
      refresh: "wait_for",
    });
  } catch (error) {
    console.error(
      `Failed to index email ${email.id}:`,
      error
    );
  }
}

export async function updateIndexedEmail(
  email: EmailDocument
): Promise<void> {
  await indexEmail(email);
}

export async function searchEmails(
  query: string,
  status?: string
) {
  const must: Record<string, unknown>[] = [];

  if (query.trim()) {
    must.push({
      multi_match: {
        query: query.trim(),
        fields: [
          "recipient",
          "recipient.keyword",
          "subject",
          "subject.keyword",
          "body",
        ],
      },
    });
  }

  if (status) {
    must.push({
      term: {
        status,
      },
    });
  }

  const result = await elasticsearch.search({
    index: EMAIL_INDEX,
    query:
      must.length > 0
        ? {
            bool: {
              must,
            },
          }
        : {
            match_all: {},
          },
    sort: [
      {
        createdAt: {
          order: "desc",
        },
      },
    ],
    size: 100,
  });

  return result.hits.hits.map((hit) => hit._source);
}