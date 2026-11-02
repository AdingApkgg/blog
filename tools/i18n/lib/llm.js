'use strict';

// LLM 客户端与配置读取。translate.js 和 taxonomy.js 共用。
//
// 配置来源（优先级从高到低）：
//   CLI 参数 > _config.local.yml 的 i18n 段 > _config.yml 的 i18n 段 > llm_tagging 段
// 默认复用站点已有的 AI 配置，不引入新的服务与密钥。

const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');

const ROOT = path.resolve(__dirname, '..', '..', '..');

function parseIntOr(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function loadConfig(args = {}) {
  const base = YAML.load(path.join(ROOT, '_config.yml')) || {};
  const localPath = path.join(ROOT, '_config.local.yml');
  const local = fs.existsSync(localPath) ? YAML.load(localPath) || {} : {};

  const i18n = Object.assign({}, base.i18n || {}, local.i18n || {});
  const tagging = Object.assign({}, base.llm_tagging || {}, local.llm_tagging || {});

  return {
    apiKey: args['api-key'] || i18n.api_key || tagging.api_key,
    endpoint: args.endpoint || i18n.endpoint || tagging.endpoint || 'https://api.deepseek.com/v1',
    model: args.model || i18n.model || tagging.model,
    concurrency: parseIntOr(args.concurrency, parseIntOr(i18n.concurrency, 2)),
    maxTokens: parseIntOr(args['max-tokens'], parseIntOr(i18n.max_tokens, 8192)),
    timeoutMs: parseIntOr(args['timeout-ms'], parseIntOr(i18n.timeout_ms, 180000)),
    retries: parseIntOr(args.retries, parseIntOr(i18n.retries, 3))
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 极简 chat 调用。失败按指数退避重试；4xx（除 429）视为配置问题，直接抛出。
async function chat(cfg, messages) {
  if (!cfg.apiKey) throw new Error('缺少 API key');
  if (!cfg.model) throw new Error('缺少模型名');

  const url = `${String(cfg.endpoint).replace(/\/+$/, '')}/chat/completions`;
  let lastError;

  for (let attempt = 1; attempt <= cfg.retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cfg.apiKey}`
        },
        body: JSON.stringify({
          model: cfg.model,
          messages,
          temperature: 0.2,
          max_tokens: cfg.maxTokens
        }),
        signal: controller.signal
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        const message = `API ${res.status}: ${body.slice(0, 300)}`;
        if (res.status !== 429 && res.status < 500) throw new Error(message);
        lastError = new Error(message);
      } else {
        const json = await res.json();
        const choice = json && json.choices && json.choices[0];
        const text = choice && choice.message ? choice.message.content : '';
        if (!text || !text.trim()) {
          lastError = new Error('API 返回空内容');
        } else {
          return text.trim();
        }
      }
    } catch (err) {
      if (err && err.message && /^API 4/.test(err.message)) throw err;
      lastError = err;
    } finally {
      clearTimeout(timer);
    }

    if (attempt < cfg.retries) await sleep(1000 * Math.pow(2, attempt - 1));
  }

  throw lastError || new Error('LLM 调用失败');
}

// 模型经常把 JSON 包在 ``` 里，这里剥掉。
function stripCodeFence(text) {
  const trimmed = String(text).trim();
  const fence = trimmed.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/);
  return fence ? fence[1].trim() : trimmed;
}

// 宽松解析 JSON：失败返回 null，由调用方决定兜底。
function parseJsonLoose(text) {
  try {
    return JSON.parse(stripCodeFence(text));
  } catch (err) {
    return null;
  }
}

module.exports = { ROOT, loadConfig, chat, stripCodeFence, parseJsonLoose, parseIntOr, sleep };
