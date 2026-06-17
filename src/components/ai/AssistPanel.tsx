"use client";

import { useRef, useState } from "react";
import {
  Sparkles,
  ImagePlus,
  Send,
  Loader2,
  KeyRound,
  Trash2,
  ExternalLink,
  FilePlus2,
  ListPlus,
  ShieldAlert,
  Scale,
} from "lucide-react";
import { useAtlasStore } from "@/lib/store";
import { createId } from "@/lib/id";
import {
  analyzeArchitecture,
  chatAboutProject,
  fileToResizedDataUrl,
  type ChatMessage,
} from "@/lib/ai/assist";
import type { Project } from "@/lib/types";
import { Button, Panel } from "@/components/ui/primitives";

const KEY_URL = "https://aistudio.google.com/app/apikey";
const inputCls =
  "w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-blue";

export function AssistPanel({ project }: { project: Project }) {
  const apiKey = useAtlasStore((s) => s.geminiApiKey);
  const setGeminiApiKey = useAtlasStore((s) => s.setGeminiApiKey);

  if (!apiKey) return <ApiKeyGate onSave={setGeminiApiKey} />;

  return <AssistBody project={project} apiKey={apiKey} />;
}

function ApiKeyGate({ onSave }: { onSave: (key: string) => void }) {
  const [draft, setDraft] = useState("");
  return (
    <div className="space-y-6">
      <Header />
      <Panel className="space-y-4 p-6">
        <div className="flex items-center gap-2 text-slate-800">
          <KeyRound className="h-5 w-5 text-brand-cyan" />
          <h3 className="font-semibold">Connect a free Gemini key</h3>
        </div>
        <p className="text-sm text-slate-500">
          The assistant runs on Google Gemini. It uses your own free API key,
          stored only in this browser - nothing is sent to a server we run. Grab
          a key from Google AI Studio (free tier), paste it below, and you are
          set.
        </p>
        <a
          href={KEY_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline"
        >
          Get a free Gemini key <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <div className="flex gap-2">
          <input
            type="password"
            value={draft}
            placeholder="Paste your Gemini API key"
            onChange={(e) => setDraft(e.target.value)}
            className={inputCls}
          />
          <Button disabled={!draft.trim()} onClick={() => onSave(draft.trim())}>
            Save key
          </Button>
        </div>
      </Panel>
    </div>
  );
}

function Header() {
  return (
    <div className="overflow-hidden rounded-md border border-navy-700 bg-navy-900 shadow-[0_18px_60px_rgba(28,27,25,0.08)]">
      <div className="grid gap-0 md:grid-cols-[minmax(220px,0.72fr)_1fr]">
        <AiSignalVisual />
        <div className="flex flex-col justify-center border-t border-navy-700 p-5 md:border-l md:border-t-0 md:p-7">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-cyan">
            AI assistant
          </p>
          <h2 className="mt-2 text-2xl font-bold">Architecture signal desk</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
            Upload the wireframe you drew, let Gemini review your architecture,
            and chat through tradeoffs. Suggestions flow into the Review and
            Tradeoffs tabs.
          </p>
        </div>
      </div>
    </div>
  );
}

function AiSignalVisual() {
  return (
    <div className="ai-signal relative min-h-56 overflow-hidden bg-[#f3efe6]">
      <div className="ai-signal-grid" />
      <div className="ai-signal-orb ai-signal-orb-a" />
      <div className="ai-signal-orb ai-signal-orb-b" />
      <div className="ai-signal-ribbon ai-signal-ribbon-a" />
      <div className="ai-signal-ribbon ai-signal-ribbon-b" />
      <div className="ai-signal-ribbon ai-signal-ribbon-c" />
      <div className="ai-signal-core" />
      <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-cyan">
          live context
        </span>
        <span className="h-2 w-2 rounded-full bg-brand-cyan shadow-[0_0_16px_rgba(47,107,94,0.65)]" />
      </div>
    </div>
  );
}

function AssistBody({ project, apiKey }: { project: Project; apiKey: string }) {
  const setGeminiApiKey = useAtlasStore((s) => s.setGeminiApiKey);
  const setReferenceImage = useAtlasStore((s) => s.setReferenceImage);
  const addSuggestions = useAtlasStore((s) => s.addSuggestions);
  const addSuggestion = useAtlasStore((s) => s.addSuggestion);
  const clearAiSuggestions = useAtlasStore((s) => s.clearAiSuggestions);
  const addDecision = useAtlasStore((s) => s.addDecision);

  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"analyze" | "chat" | "image" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [lastCount, setLastCount] = useState<number | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");

  const refImage = project.referenceImage;

  async function onPickImage(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy("image");
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setReferenceImage(project.id, {
        dataUrl,
        name: file.name,
        addedAt: new Date().toISOString(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load that image.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onAnalyze() {
    setError(null);
    setBusy("analyze");
    setSummary(null);
    try {
      const result = await analyzeArchitecture(project, apiKey);
      clearAiSuggestions(project.id);
      addSuggestions(project.id, result.suggestions);
      setSummary(result.summary);
      setLastCount(result.suggestions.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setBusy(null);
    }
  }

  async function onSend() {
    const text = draft.trim();
    if (!text) return;
    setError(null);
    setDraft("");
    const history = messages;
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy("chat");
    try {
      const reply = await chatAboutProject(project, history, text, apiKey);
      setMessages((m) => [...m, { role: "model", text: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed.");
      setMessages((m) => [
        ...m,
        { role: "model", text: "(failed to respond - try again)" },
      ]);
    } finally {
      setBusy(null);
    }
  }

  function saveReplyAsNote(text: string) {
    const title = text.split("\n")[0].slice(0, 80) || "AI suggestion";
    addSuggestion(project.id, {
      id: createId("sug"),
      source: "ai",
      severity: "info",
      title,
      description: "",
      recommendation: text,
      createdAt: new Date().toISOString(),
    });
  }

  function saveReplyAsAdr(text: string) {
    const title = text.split("\n")[0].slice(0, 80) || "Decision from AI assist";
    addDecision(project.id, {
      id: createId("dec"),
      title,
      context: "Captured from the AI assistant.",
      decision: text,
      alternatives: [],
      tradeoffs: [],
      status: "proposed",
    });
  }

  return (
    <div className="space-y-6">
      <Header />

      {/* Wireframe image */}
      <Panel className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-800">Wireframe / sketch</h3>
          {refImage && (
            <button
              onClick={() => setReferenceImage(project.id, null)}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          )}
        </div>
        <p className="text-sm text-slate-500">
          Drop in a photo or screenshot of the design you built. Gemini reads it
          alongside your components when you analyze or chat.
        </p>
        {refImage ? (
          <div className="overflow-hidden rounded-lg border border-navy-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={refImage.dataUrl}
              alt={refImage.name}
              className="max-h-80 w-full object-contain bg-navy-900"
            />
          </div>
        ) : (
          <Button
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            disabled={busy === "image"}
          >
            {busy === "image" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            Upload wireframe
          </Button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPickImage(e.target.files?.[0])}
        />
      </Panel>

      {/* Analyze */}
      <Panel className="space-y-4 p-5">
        <h3 className="font-semibold text-slate-800">Review my architecture</h3>
        <p className="text-sm text-slate-500">
          Gemini reviews your brief, components{refImage ? ", and wireframe" : ""}{" "}
          and writes suggestions into your Review and Tradeoffs tabs.
        </p>
        <Button onClick={onAnalyze} disabled={busy !== null}>
          {busy === "analyze" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Analyze with AI
        </Button>
        {summary && (
          <div className="rounded-lg border border-navy-700 bg-navy-900/60 p-4 text-sm text-slate-600">
            <p>{summary}</p>
            {lastCount !== null && (
              <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 text-brand-cyan">
                  <ShieldAlert className="h-3.5 w-3.5" /> {lastCount} suggestion
                  {lastCount === 1 ? "" : "s"} added
                </span>
                <span>· see the</span>
                <span className="inline-flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" /> Review
                </span>
                <span>and</span>
                <span className="inline-flex items-center gap-1">
                  <Scale className="h-3.5 w-3.5" /> Tradeoffs
                </span>
                <span>tabs</span>
              </p>
            )}
          </div>
        )}
      </Panel>

      {/* Chat */}
      <Panel className="space-y-4 p-5">
        <h3 className="font-semibold text-slate-800">Ask the assistant</h3>
        {messages.length > 0 && (
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-lg bg-navy-700 px-3 py-2 text-sm text-ink"
                    : "max-w-[90%] rounded-lg border border-navy-700 bg-navy-900/60 px-3 py-2 text-sm text-slate-700"
                }
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                {m.role === "model" && (
                  <div className="mt-2 flex gap-3 text-xs">
                    <button
                      onClick={() => saveReplyAsNote(m.text)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-brand-cyan"
                    >
                      <ListPlus className="h-3.5 w-3.5" /> Add to Review
                    </button>
                    <button
                      onClick={() => saveReplyAsAdr(m.text)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-brand-cyan"
                    >
                      <FilePlus2 className="h-3.5 w-3.5" /> Save as ADR
                    </button>
                  </div>
                )}
              </div>
            ))}
            {busy === "chat" && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
              </div>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={draft}
            placeholder="e.g. Where are the weak points in my upload pipeline?"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            className={inputCls}
          />
          <Button onClick={onSend} disabled={busy !== null || !draft.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Panel>

      {error && (
        <Panel className="border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
          {error}
        </Panel>
      )}

      <button
        onClick={() => setGeminiApiKey("")}
        className="text-xs text-slate-500 hover:text-slate-700"
      >
        Disconnect Gemini key
      </button>
    </div>
  );
}
