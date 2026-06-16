import { describe, it, expect } from "vitest";
import { getTechLogo } from "../techLogos";

describe("getTechLogo", () => {
  it("maps each component's default technology to the correct brand", () => {
    // Mirrors the defaultTechnology of every catalog component that has one.
    const cases: [string, string][] = [
      ["Postgres", "PostgreSQL"], // SQL Database
      ["DynamoDB", "Amazon DynamoDB"], // NoSQL Database
      ["S3", "Amazon S3"], // Object Storage
      ["Redis", "Redis"], // Cache
      ["SQS", "Amazon SQS"], // Message Queue
    ];
    for (const [tech, title] of cases) {
      expect(getTechLogo(tech)?.title, tech).toBe(title);
    }
  });

  it("never resolves a SQL technology to a NoSQL logo", () => {
    expect(getTechLogo("Postgres")?.title).toBe("PostgreSQL");
    expect(getTechLogo("MySQL")?.title).toBe("MySQL");
    expect(getTechLogo("SQLite")?.title).toBe("SQLite");
    // Postgres must not accidentally match the "mongo" token, etc.
    expect(getTechLogo("Postgres")?.title).not.toBe("MongoDB");
  });

  it("resolves multi-option strings to the first listed brand", () => {
    expect(getTechLogo("Elasticsearch / OpenSearch")?.title).toBe("Elasticsearch");
    expect(getTechLogo("Postgres full-text")?.title).toBe("PostgreSQL");
  });

  it("serves AWS logos as bundled images (Simple Icons dropped them)", () => {
    const s3 = getTechLogo("Amazon S3");
    expect(s3?.kind).toBe("img");
    const dynamo = getTechLogo("DynamoDB");
    expect(dynamo?.kind).toBe("img");
  });

  it("matches whole tokens, not substrings (no false positives)", () => {
    // "go" must not match the "go" inside "mongodb", and "google".
    expect(getTechLogo("Go")?.title).toBe("Go");
    expect(getTechLogo("MongoDB")?.title).toBe("MongoDB");
    expect(getTechLogo("Google Cloud")?.title).toBe("Google Cloud");
    // multi-word brands stay distinct
    expect(getTechLogo("Google Cloud Storage")?.title).toBe("Google Cloud Storage");
    expect(getTechLogo("Ruby on Rails")?.title).toBe("Ruby on Rails");
    expect(getTechLogo("Next.js (SSR)")?.title).toBe("Next.js");
  });

  it("resolves the new frontend and deepened tradeoff options to a logo", () => {
    const expected: Record<string, string> = {
      "Next.js": "Next.js",
      "React SPA": "React",
      SvelteKit: "Svelte",
      Astro: "Astro",
      Remix: "Remix",
      Nuxt: "Nuxt",
      CockroachDB: "Cockroach Labs",
      Supabase: "Supabase",
      Cassandra: "Apache Cassandra",
      NATS: "NATS.io",
      tRPC: "tRPC",
      Algolia: "Algolia",
      Meilisearch: "Meilisearch",
      Milvus: "Milvus",
      Clerk: "Clerk",
      Keycloak: "Keycloak",
      Sentry: "Sentry",
      "React Native": "React",
    };
    for (const [tech, title] of Object.entries(expected)) {
      expect(getTechLogo(tech)?.title, tech).toBe(title);
    }
  });

  it("returns null for generic, brand-less technologies", () => {
    for (const tech of [
      "REST",
      "Object storage",
      "Container service",
      "Custom auth",
      "In-memory cache",
    ]) {
      expect(getTechLogo(tech), tech).toBeNull();
    }
  });
});
