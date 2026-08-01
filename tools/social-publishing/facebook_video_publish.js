#!/usr/bin/env node
/**
 * Publish video to a Facebook Page — Reels or feed video.
 *
 * Why this exists: skills/shared/posting/facebook-post.skill.md (in
 * jarvis-mission-control) only ever implemented /photos and /feed. There was no
 * video path at all, so a video handed to that skill could never publish. Reels
 * in particular need a three-phase start/upload/finish flow, which nothing in
 * the stack had.
 *
 * Two hard preconditions are enforced before anything is sent, both of them
 * lessons already written down and then not applied:
 *   RULE-001  verify the token via /debug_token before any API write.
 *   RULE-010  content validation must BLOCK, not advise.
 *
 * Note on targets: the Graph API publishes to PAGES only. Meta removed
 * publish_actions in v3.0 (2018); there is no supported way to post to a
 * personal profile timeline. If the goal is "it shows up on my personal
 * Facebook", publish to the Page and share from there.
 *
 * Usage:
 *   node facebook_video_publish.js --page-id 104692988625872 \
 *     --file ./clip.mp4 --caption "..." --brand hamperd --type reel
 *   node facebook_video_publish.js --page-id ... --file-url https://... \
 *     --caption "..." --brand hamperd --type video
 *
 * Token: env SECRET_FACEBOOK_HAMPERD_PAGE_TOKEN (or --token).
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const GRAPH_VERSION = process.env.FB_GRAPH_VERSION || "v23.0";
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;
const REQUIRED_SCOPES = ["pages_manage_posts", "pages_read_engagement"];
const VALIDATOR = path.join(__dirname, "content_policy_validator.py");

class PublishError extends Error {
  constructor(message, { code, subcode, phase } = {}) {
    super(message);
    this.name = "PublishError";
    this.code = code;
    this.subcode = subcode;
    this.phase = phase;
  }
}

/** Surface Graph errors with the code intact — 190 vs 200 vs 368 need different fixes. */
async function graph(url, options = {}, phase = "request") {
  const res = await fetch(url, options);
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new PublishError(`${phase}: non-JSON response (HTTP ${res.status}): ${text.slice(0, 300)}`, { phase });
  }
  if (!res.ok || body.error) {
    const e = body.error || {};
    throw new PublishError(
      `${phase}: ${e.message || `HTTP ${res.status}`}` +
        (e.code ? ` (code ${e.code}${e.error_subcode ? `/${e.error_subcode}` : ""})` : ""),
      { code: e.code, subcode: e.error_subcode, phase }
    );
  }
  return body;
}

/** RULE-001 — never write to the API on an unverified credential. */
async function verifyToken(token) {
  const url = `${GRAPH}/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(token)}`;
  const { data } = await graph(url, {}, "token check");

  if (!data || !data.is_valid) {
    const why = (data && data.error && data.error.message) || "token is not valid";
    throw new PublishError(
      `token check: ${why}. Regenerate the Page access token in Meta Business Suite ` +
        `(System User > Generate token) and update the secret.`,
      { code: (data && data.error && data.error.code) || 190, phase: "token check" }
    );
  }
  if (data.expires_at && data.expires_at !== 0 && data.expires_at * 1000 < Date.now()) {
    throw new PublishError(`token check: token expired at ${new Date(data.expires_at * 1000).toISOString()}`, {
      code: 190,
      phase: "token check",
    });
  }
  const scopes = data.scopes || [];
  const missing = REQUIRED_SCOPES.filter((s) => !scopes.includes(s));
  if (missing.length) {
    throw new PublishError(`token check: missing required scope(s): ${missing.join(", ")}`, { phase: "token check" });
  }
  return data;
}

/** RULE-010 — blocking, not advisory. Non-zero exit means do not publish. */
function validateCaption(caption, brand, surface = "facebook") {
  const r = spawnSync("python3", [VALIDATOR, "--brand", brand, "--surface", surface, "--text", caption], {
    encoding: "utf8",
  });
  if (r.error) throw new PublishError(`content validation could not run: ${r.error.message}`, { phase: "validate" });
  if (r.status !== 0) {
    throw new PublishError(`content validation failed — refusing to publish.\n${(r.stderr || "").trim()}`, {
      phase: "validate",
    });
  }
}

/** Reels: three-phase start -> upload -> finish. */
async function publishReel({ pageId, token, caption, file, fileUrl }) {
  const start = await graph(
    `${GRAPH}/${pageId}/video_reels`,
    { method: "POST", body: new URLSearchParams({ upload_phase: "start", access_token: token }) },
    "reel start"
  );
  const { video_id: videoId, upload_url: uploadUrl } = start;
  if (!videoId || !uploadUrl) throw new PublishError("reel start: no video_id/upload_url returned", { phase: "reel start" });

  const headers = { Authorization: `OAuth ${token}` };
  let body;
  if (fileUrl) {
    headers.file_url = fileUrl;
  } else {
    const bytes = fs.readFileSync(file);
    headers.offset = "0";
    headers.file_size = String(bytes.length);
    headers["Content-Type"] = "application/octet-stream";
    body = bytes;
  }
  await graph(uploadUrl, { method: "POST", headers, body }, "reel upload");

  await graph(
    `${GRAPH}/${pageId}/video_reels`,
    {
      method: "POST",
      body: new URLSearchParams({
        upload_phase: "finish",
        video_id: videoId,
        video_state: "PUBLISHED",
        description: caption,
        access_token: token,
      }),
    },
    "reel finish"
  );
  return videoId;
}

/** Feed video. Hosted URL uses file_url; a local file is sent as multipart. */
async function publishFeedVideo({ pageId, token, caption, file, fileUrl }) {
  const url = `${GRAPH}/${pageId}/videos`;
  let options;
  if (fileUrl) {
    options = {
      method: "POST",
      body: new URLSearchParams({ file_url: fileUrl, description: caption, access_token: token }),
    };
  } else {
    const form = new FormData();
    form.append("source", new Blob([fs.readFileSync(file)]), path.basename(file));
    form.append("description", caption);
    form.append("access_token", token);
    options = { method: "POST", body: form };
  }
  const out = await graph(url, options, "video upload");
  return out.id;
}

/** Encoding is async on Meta's side; "accepted" is not "published" (RULE-005). */
async function waitForProcessing(videoId, token, { timeoutMs = 300000, intervalMs = 5000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const { status } = await graph(
      `${GRAPH}/${videoId}?fields=status&access_token=${encodeURIComponent(token)}`,
      {},
      "status poll"
    );
    const phase = status && status.video_status;
    if (phase === "ready") return status;
    if (phase === "error") {
      throw new PublishError(`processing failed: ${JSON.stringify(status)}`, { phase: "processing" });
    }
    if (Date.now() > deadline) return { video_status: phase || "unknown", timed_out: true };
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

async function publishVideo({ pageId, token, caption, brand, file, fileUrl, type = "reel", skipWait = false }) {
  if (!pageId) throw new PublishError("pageId is required");
  if (!token) throw new PublishError("missing Page access token (SECRET_FACEBOOK_HAMPERD_PAGE_TOKEN)");
  if (!file && !fileUrl) throw new PublishError("one of --file or --file-url is required");
  if (file && !fs.existsSync(file)) throw new PublishError(`file not found: ${file}`);

  validateCaption(caption, brand);
  const tokenInfo = await verifyToken(token);

  const videoId =
    type === "reel"
      ? await publishReel({ pageId, token, caption, file, fileUrl })
      : await publishFeedVideo({ pageId, token, caption, file, fileUrl });

  const status = skipWait ? { skipped: true } : await waitForProcessing(videoId, token);
  return { success: true, video_id: videoId, type, page_id: pageId, token_app: tokenInfo.app_id, status };
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2).replace(/-/g, "_");
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      i += 1;
    }
  }
  return out;
}

async function main() {
  const a = parseArgs(process.argv.slice(2));
  try {
    const result = await publishVideo({
      pageId: a.page_id,
      token: a.token || process.env.SECRET_FACEBOOK_HAMPERD_PAGE_TOKEN,
      caption: a.caption || "",
      brand: a.brand || "hamperd",
      file: a.file,
      fileUrl: a.file_url,
      type: a.type === "video" ? "video" : "reel",
      skipWait: Boolean(a.no_wait),
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(`FAILED — ${err.message}`);
    if (err.code === 190) {
      console.error("\nCode 190 is an auth failure. The Page token is invalid, expired, or revoked.");
      console.error("This is the same failure that paused facebook-post.skill.md back in March.");
    }
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = { publishVideo, verifyToken, validateCaption, publishReel, publishFeedVideo, waitForProcessing, PublishError };
