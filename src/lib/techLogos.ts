import {
  siPostgresql, siMysql, siMariadb, siSqlite, siCockroachlabs, siSupabase,
  siPlanetscale, siNeon, siMongodb, siApachecassandra, siScylladb, siFirebase,
  siRedis, siApachekafka, siRabbitmq, siNatsdotio, siApachepulsar, siCelery,
  siTemporal, siElasticsearch, siOpensearch, siAlgolia, siMeilisearch,
  siApachesolr, siQdrant, siMilvus, siClickhouse, siSnowflake, siGooglebigquery,
  siDuckdb, siGraphql, siTrpc, siApollographql, siSocketdotio, siReact,
  siNextdotjs, siVuedotjs, siNuxt, siAngular, siSvelte, siSolid, siRemix,
  siAstro, siQwik, siFlutter, siSwift, siKotlin, siExpo, siNodedotjs, siDeno,
  siBun, siPython, siGo, siRust, siOpenjdk, siRuby, siPhp, siElixir,
  siTypescript, siExpress, siNestjs, siFastify, siDjango, siFlask, siFastapi,
  siRubyonrails, siSpring, siLaravel, siGin, siDocker, siKubernetes,
  siGooglecloud, siGooglecloudstorage, siVercel, siNetlify, siCloudflare,
  siCloudflareworkers, siFlydotio, siRender, siRailway, siDigitalocean,
  siFastly, siAkamai, siMinio, siNginx, siEnvoyproxy, siTraefikproxy, siKong,
  siCaddy, siAuth0, siClerk, siOkta, siKeycloak, siStripe, siAnthropic,
  siHuggingface, siLangchain, siOllama, siReplicate, siDatadog, siGrafana,
  siPrometheus, siSentry, siNewrelic, siOpentelemetry, siSplunk, siPagerduty,
  siGithub, siGitlab, siCircleci, siJenkins, siTerraform, siPulumi,
} from "simple-icons";

export type TechLogo =
  // A single-path, single-color glyph (Simple Icons) we can tint.
  | { kind: "path"; title: string; path: string; hex: string }
  // A bundled image asset, for richer/multi-color logos Simple Icons can't ship
  // (Amazon pulled all its brand icons from the set, so AWS services live here).
  | { kind: "img"; title: string; src: string };

type IconData = { title: string; hex: string; path: string };

/**
 * A node's `technology` is free text and often lists several options
 * ("Elasticsearch / OpenSearch", "Managed auth (Clerk/Auth0/Cognito)"). We split
 * it into tokens and match each brand's keywords against them:
 *   - a single-word keyword must equal a whole token, so "go" matches "Go" but
 *     never the "go" inside "mongodb";
 *   - a multi-word keyword (with a space) matches as a compacted substring, so
 *     "google cloud storage" matches but stays distinct from "google cloud".
 * Brands are checked in order, so list the more specific entry first.
 */
function tokenize(s: string): string[] {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}
function compact(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
function hits(tokens: string[], cmp: string, keywords: string[]): boolean {
  return keywords.some((kw) =>
    kw.includes(" ") ? cmp.includes(compact(kw)) : tokens.includes(kw)
  );
}

/** Brands with no Simple Icon, served from a bundled SVG in /public/logos. */
const IMAGE_BRANDS: { keywords: string[]; title: string; src: string }[] = [
  { keywords: ["dynamodb", "dynamo"], title: "Amazon DynamoDB", src: "/logos/dynamodb.svg" },
  { keywords: ["sqs"], title: "Amazon SQS", src: "/logos/sqs.svg" },
  { keywords: ["s3"], title: "Amazon S3", src: "/logos/s3.svg" },
  { keywords: ["azure blob"], title: "Azure Blob Storage", src: "/logos/azure-blob.svg" },
];

const PATH_BRANDS: { keywords: string[]; icon: IconData }[] = [
  // Databases (SQL)
  { keywords: ["postgres", "postgresql"], icon: siPostgresql },
  { keywords: ["mysql"], icon: siMysql },
  { keywords: ["mariadb"], icon: siMariadb },
  { keywords: ["sqlite"], icon: siSqlite },
  { keywords: ["cockroachdb", "cockroach"], icon: siCockroachlabs },
  { keywords: ["supabase"], icon: siSupabase },
  { keywords: ["planetscale"], icon: siPlanetscale },
  { keywords: ["neon"], icon: siNeon },
  // Databases (NoSQL)
  { keywords: ["mongodb", "mongo"], icon: siMongodb },
  { keywords: ["cassandra"], icon: siApachecassandra },
  { keywords: ["scylladb", "scylla"], icon: siScylladb },
  { keywords: ["firebase", "firestore"], icon: siFirebase },
  // Cache
  { keywords: ["redis"], icon: siRedis },
  // Queue / streaming
  { keywords: ["kafka"], icon: siApachekafka },
  { keywords: ["rabbitmq"], icon: siRabbitmq },
  { keywords: ["nats"], icon: siNatsdotio },
  { keywords: ["pulsar"], icon: siApachepulsar },
  { keywords: ["celery"], icon: siCelery },
  { keywords: ["temporal"], icon: siTemporal },
  // Search
  { keywords: ["elasticsearch", "elastic"], icon: siElasticsearch },
  { keywords: ["opensearch"], icon: siOpensearch },
  { keywords: ["algolia"], icon: siAlgolia },
  { keywords: ["meilisearch", "meili"], icon: siMeilisearch },
  { keywords: ["solr"], icon: siApachesolr },
  // Vector / analytics
  { keywords: ["qdrant"], icon: siQdrant },
  { keywords: ["milvus"], icon: siMilvus },
  { keywords: ["clickhouse"], icon: siClickhouse },
  { keywords: ["snowflake"], icon: siSnowflake },
  { keywords: ["bigquery"], icon: siGooglebigquery },
  { keywords: ["duckdb"], icon: siDuckdb },
  // API
  { keywords: ["graphql"], icon: siGraphql },
  { keywords: ["trpc"], icon: siTrpc },
  { keywords: ["apollo"], icon: siApollographql },
  { keywords: ["socket", "socketio"], icon: siSocketdotio },
  // Frontend / client
  { keywords: ["react"], icon: siReact },
  { keywords: ["next", "nextjs"], icon: siNextdotjs },
  { keywords: ["vue"], icon: siVuedotjs },
  { keywords: ["nuxt"], icon: siNuxt },
  { keywords: ["angular"], icon: siAngular },
  { keywords: ["svelte", "sveltekit"], icon: siSvelte },
  { keywords: ["solidjs", "solid"], icon: siSolid },
  { keywords: ["remix"], icon: siRemix },
  { keywords: ["astro"], icon: siAstro },
  { keywords: ["qwik"], icon: siQwik },
  { keywords: ["flutter"], icon: siFlutter },
  { keywords: ["swift", "swiftui"], icon: siSwift },
  { keywords: ["kotlin"], icon: siKotlin },
  { keywords: ["expo"], icon: siExpo },
  // Languages / runtimes
  { keywords: ["node", "nodejs"], icon: siNodedotjs },
  { keywords: ["deno"], icon: siDeno },
  { keywords: ["bun"], icon: siBun },
  { keywords: ["python"], icon: siPython },
  { keywords: ["go", "golang"], icon: siGo },
  { keywords: ["rust"], icon: siRust },
  { keywords: ["java"], icon: siOpenjdk },
  { keywords: ["php"], icon: siPhp },
  { keywords: ["elixir"], icon: siElixir },
  { keywords: ["typescript"], icon: siTypescript },
  // Backend frameworks (Rails before Ruby so "Ruby on Rails" reads as Rails)
  { keywords: ["express"], icon: siExpress },
  { keywords: ["nestjs", "nest"], icon: siNestjs },
  { keywords: ["fastify"], icon: siFastify },
  { keywords: ["django"], icon: siDjango },
  { keywords: ["flask"], icon: siFlask },
  { keywords: ["fastapi"], icon: siFastapi },
  { keywords: ["rails"], icon: siRubyonrails },
  { keywords: ["ruby"], icon: siRuby },
  { keywords: ["spring"], icon: siSpring },
  { keywords: ["laravel"], icon: siLaravel },
  { keywords: ["gin"], icon: siGin },
  // Compute / hosting / orchestration (specific before generic)
  { keywords: ["docker"], icon: siDocker },
  { keywords: ["kubernetes", "k8s"], icon: siKubernetes },
  { keywords: ["google cloud storage", "gcs"], icon: siGooglecloudstorage },
  { keywords: ["cloudflare workers"], icon: siCloudflareworkers },
  { keywords: ["cloudflare"], icon: siCloudflare },
  { keywords: ["google cloud", "gcp"], icon: siGooglecloud },
  { keywords: ["vercel"], icon: siVercel },
  { keywords: ["netlify"], icon: siNetlify },
  { keywords: ["fly"], icon: siFlydotio },
  { keywords: ["render"], icon: siRender },
  { keywords: ["railway"], icon: siRailway },
  { keywords: ["digitalocean"], icon: siDigitalocean },
  // CDN / edge / proxy / gateway
  { keywords: ["fastly"], icon: siFastly },
  { keywords: ["akamai"], icon: siAkamai },
  { keywords: ["minio"], icon: siMinio },
  { keywords: ["nginx"], icon: siNginx },
  { keywords: ["envoy"], icon: siEnvoyproxy },
  { keywords: ["traefik"], icon: siTraefikproxy },
  { keywords: ["kong"], icon: siKong },
  { keywords: ["caddy"], icon: siCaddy },
  // Auth / identity
  { keywords: ["auth0"], icon: siAuth0 },
  { keywords: ["clerk"], icon: siClerk },
  { keywords: ["okta"], icon: siOkta },
  { keywords: ["keycloak"], icon: siKeycloak },
  // External / payments / AI
  { keywords: ["stripe"], icon: siStripe },
  { keywords: ["anthropic", "claude"], icon: siAnthropic },
  { keywords: ["hugging face", "huggingface"], icon: siHuggingface },
  { keywords: ["langchain"], icon: siLangchain },
  { keywords: ["ollama"], icon: siOllama },
  { keywords: ["replicate"], icon: siReplicate },
  // Observability
  { keywords: ["datadog"], icon: siDatadog },
  { keywords: ["grafana"], icon: siGrafana },
  { keywords: ["prometheus"], icon: siPrometheus },
  { keywords: ["sentry"], icon: siSentry },
  { keywords: ["new relic", "newrelic"], icon: siNewrelic },
  { keywords: ["opentelemetry", "otel"], icon: siOpentelemetry },
  { keywords: ["splunk"], icon: siSplunk },
  { keywords: ["pagerduty"], icon: siPagerduty },
  // CI/CD / IaC / version control
  { keywords: ["github"], icon: siGithub },
  { keywords: ["gitlab"], icon: siGitlab },
  { keywords: ["circleci"], icon: siCircleci },
  { keywords: ["jenkins"], icon: siJenkins },
  { keywords: ["terraform"], icon: siTerraform },
  { keywords: ["pulumi"], icon: siPulumi },
];

/** Returns the brand logo for a technology string, or null to use the fallback. */
export function getTechLogo(technology?: string | null): TechLogo | null {
  if (!technology) return null;
  const tokens = tokenize(technology);
  const cmp = compact(technology);
  for (const b of IMAGE_BRANDS) {
    if (hits(tokens, cmp, b.keywords)) {
      return { kind: "img", title: b.title, src: b.src };
    }
  }
  for (const b of PATH_BRANDS) {
    if (hits(tokens, cmp, b.keywords)) {
      return { kind: "path", title: b.icon.title, path: b.icon.path, hex: `#${b.icon.hex}` };
    }
  }
  return null;
}
