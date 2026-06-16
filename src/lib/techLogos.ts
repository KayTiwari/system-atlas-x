import {
  siPostgresql,
  siMysql,
  siSqlite,
  siMongodb,
  siRedis,
  siApachekafka,
  siRabbitmq,
  siFirebase,
  siGraphql,
  siElasticsearch,
  siOpensearch,
  siDatadog,
  siGrafana,
  siPrometheus,
  siAuth0,
  siClerk,
  siQdrant,
  siDocker,
  siKubernetes,
  siGooglecloudstorage,
  siCloudflare,
} from "simple-icons";

export type TechLogo =
  // A single-path, single-color glyph (Simple Icons) we can tint.
  | { kind: "path"; title: string; path: string; hex: string }
  // A bundled image asset, for richer/multi-color logos Simple Icons can't ship
  // (Amazon pulled all its brand icons from the set, so AWS services live here).
  | { kind: "img"; title: string; src: string };

type IconData = { title: string; hex: string; path: string };

/**
 * Brands with no Simple Icon, served from a bundled SVG in /public/logos.
 * Checked before the path list so an AWS service never falls through to a
 * same-token generic match.
 */
const IMAGE_ENTRIES: { token: string; title: string; src: string }[] = [
  { token: "dynamo", title: "Amazon DynamoDB", src: "/logos/dynamodb.svg" },
  { token: "sqs", title: "Amazon SQS", src: "/logos/sqs.svg" },
  { token: "s3", title: "Amazon S3", src: "/logos/s3.svg" },
  { token: "azure blob", title: "Azure Blob Storage", src: "/logos/azure-blob.svg" },
];

/**
 * Maps a brand token to its logo. A node's `technology` is free text and often
 * lists several options ("Elasticsearch / OpenSearch", "Managed auth
 * (Clerk/Auth0/Cognito)"), so we match on the first token that appears in the
 * string rather than on an exact name. Order matters: list the primary/default
 * option first. Anything without a recognizable brand (REST, Object storage,
 * Container service, AWS services Simple Icons no longer ships) falls back to
 * the generic category icon.
 */
const ENTRIES: { token: string; icon: IconData }[] = [
  { token: "postgres", icon: siPostgresql },
  { token: "mysql", icon: siMysql },
  { token: "sqlite", icon: siSqlite },
  { token: "mongo", icon: siMongodb },
  { token: "redis", icon: siRedis },
  { token: "kafka", icon: siApachekafka },
  { token: "rabbitmq", icon: siRabbitmq },
  { token: "firebase", icon: siFirebase },
  { token: "graphql", icon: siGraphql },
  { token: "elasticsearch", icon: siElasticsearch },
  { token: "opensearch", icon: siOpensearch },
  { token: "datadog", icon: siDatadog },
  { token: "grafana", icon: siGrafana },
  { token: "prometheus", icon: siPrometheus },
  { token: "auth0", icon: siAuth0 },
  { token: "clerk", icon: siClerk },
  { token: "qdrant", icon: siQdrant },
  { token: "docker", icon: siDocker },
  { token: "kubernetes", icon: siKubernetes },
  { token: "google cloud storage", icon: siGooglecloudstorage },
  { token: "cloudflare", icon: siCloudflare },
];

/** Returns the brand logo for a technology string, or null to use the fallback. */
export function getTechLogo(technology?: string | null): TechLogo | null {
  if (!technology) return null;
  const norm = technology.toLowerCase();
  for (const entry of IMAGE_ENTRIES) {
    if (norm.includes(entry.token)) {
      return { kind: "img", title: entry.title, src: entry.src };
    }
  }
  for (const { token, icon } of ENTRIES) {
    if (norm.includes(token)) {
      return { kind: "path", title: icon.title, path: icon.path, hex: `#${icon.hex}` };
    }
  }
  return null;
}
