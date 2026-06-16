import {
  siPostgresql,
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
} from "simple-icons";

export type TechLogo = { title: string; path: string; hex: string };

type IconData = { title: string; hex: string; path: string };

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
];

/** Returns the brand logo for a technology string, or null to use the fallback. */
export function getTechLogo(technology?: string | null): TechLogo | null {
  if (!technology) return null;
  const norm = technology.toLowerCase();
  for (const { token, icon } of ENTRIES) {
    if (norm.includes(token)) {
      return { title: icon.title, path: icon.path, hex: `#${icon.hex}` };
    }
  }
  return null;
}
