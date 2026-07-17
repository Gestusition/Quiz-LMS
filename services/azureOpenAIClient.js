const { AppError } = require('../utils/appError');

const REQUEST_TIMEOUT_MS = 45000;
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);
const MAX_RETRIES = 1;

function deploymentUrl(config, deployment, operation) {
  return `${config.endpoint}/openai/deployments/${encodeURIComponent(deployment)}/${operation}?api-version=${encodeURIComponent(config.apiVersion)}`;
}

async function postAzure(url, payload, config, options = {}) {
  const retries = Number.isInteger(options.maxRetries)
    ? Math.min(Math.max(options.maxRetries, 0), MAX_RETRIES)
    : MAX_RETRIES;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, options.timeoutMs || REQUEST_TIMEOUT_MS);
    const detachSignal = linkAbortSignal(options.signal, controller);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': config.apiKey },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      if (!response.ok) {
        if (attempt < retries && RETRYABLE_STATUSES.has(response.status)) {
          await retryDelay(response, attempt, options.signal);
          continue;
        }
        throw providerError(response.status);
      }
      try {
        return await response.json();
      } catch (error) {
        throw new AppError({
          status: 502,
          error: 'Invalid Azure OpenAI response',
          message: 'Azure OpenAI returned an unreadable response.'
        });
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (options.signal?.aborted) {
        throw new AppError({
          status: 409,
          error: 'AI request cancelled',
          message: 'The AI request was cancelled before it completed.'
        });
      }
      if (timedOut) {
        throw new AppError({
          status: 502,
          error: 'Azure OpenAI timeout',
          message: 'Azure OpenAI timed out. Try again with a smaller request.'
        });
      }
      if (attempt < retries && error?.name !== 'AbortError') {
        await retryDelay(null, attempt, options.signal);
        continue;
      }
      throw new AppError({
        status: 502,
        error: 'Azure OpenAI unavailable',
        message: error?.name === 'AbortError'
          ? 'Azure OpenAI timed out. Try again with a smaller request.'
          : 'Azure OpenAI could not be reached. Check your endpoint and network connection.'
      });
    } finally {
      clearTimeout(timeout);
      detachSignal();
    }
  }

  throw new AppError({
    status: 502,
    error: 'Azure OpenAI unavailable',
    message: 'Azure OpenAI could not be reached.'
  });
}

async function callChat(messages, config, options = {}) {
  const responseFormat = options.responseSchema
    ? {
        type: 'json_schema',
        json_schema: {
          name: options.schemaName || 'structured_response',
          strict: true,
          schema: options.responseSchema
        }
      }
    : { type: 'json_object' };
  const url = deploymentUrl(config, config.chatDeployment, 'chat/completions');
  const maxTokens = options.maxTokens ?? 6000;
  let data;
  try {
    data = await postAzure(
      url,
      {
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: maxTokens,
        response_format: responseFormat
      },
      config,
      options
    );
  } catch (error) {
    if (error?.providerStatus !== 400) throw error;

    // Some Azure deployments reject strict structured output, classic token
    // parameters, or temperature. Retry exactly once in broadly compatible
    // JSON mode; callers still parse and validate the returned application schema.
    data = await postAzure(
      url,
      {
        messages,
        max_completion_tokens: maxTokens,
        response_format: { type: 'json_object' }
      },
      config,
      { ...options, maxRetries: 0 }
    );
  }
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new AppError({ status: 502, error: 'Invalid AI response', message: 'Azure OpenAI returned no usable content.' });
  }
  return content;
}

async function callEmbeddings(inputs, config, options = {}) {
  if (!config.embeddingDeployment) {
    throw new AppError({
      status: 400,
      error: 'AI settings incomplete',
      message: 'Enter an Azure OpenAI embeddings deployment before using course material.'
    });
  }
  const data = await postAzure(
    deploymentUrl(config, config.embeddingDeployment, 'embeddings'),
    { input: inputs },
    config,
    options
  );
  const ordered = Array.isArray(data?.data) ? [...data.data].sort((a, b) => a.index - b.index) : [];
  if (ordered.length !== inputs.length || ordered.some(item => !Array.isArray(item.embedding))) {
    throw new AppError({ status: 502, error: 'Invalid embedding response', message: 'Azure OpenAI returned incomplete embeddings.' });
  }
  return ordered.map(item => item.embedding);
}

function providerError(status) {
  const error = new AppError({
    status: status === 429 ? 429 : 502,
    error: 'Azure OpenAI request failed',
    message: status === 401 || status === 403
      ? 'Azure OpenAI rejected the credentials. Check your private AI settings.'
      : `Azure OpenAI returned status ${status}. Check the endpoint, deployment, and API version.`
  });
  // This non-enumerable marker is for bounded internal compatibility decisions.
  // Provider response bodies and headers are intentionally never attached.
  Object.defineProperty(error, 'providerStatus', {
    configurable: false,
    enumerable: false,
    value: status,
    writable: false
  });
  return error;
}

function linkAbortSignal(signal, controller) {
  if (!signal) return () => {};
  if (signal.aborted) {
    controller.abort('cancelled');
    return () => {};
  }
  const abort = () => controller.abort('cancelled');
  signal.addEventListener('abort', abort, { once: true });
  return () => signal.removeEventListener('abort', abort);
}

async function retryDelay(response, attempt, signal) {
  const retryAfter = Number(response?.headers?.get?.('retry-after'));
  const delayMs = Number.isFinite(retryAfter)
    ? Math.min(Math.max(retryAfter * 1000, 0), 1000)
    : 150 * (attempt + 1);
  if (!delayMs) return;
  await new Promise((resolve, reject) => {
    let abort = null;
    const timer = setTimeout(() => {
      if (abort && signal) signal.removeEventListener('abort', abort);
      resolve();
    }, delayMs);
    if (!signal) return;
    abort = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
      reject(new AppError({
        status: 409,
        error: 'AI request cancelled',
        message: 'The AI request was cancelled before it completed.'
      }));
    };
    signal.addEventListener('abort', abort, { once: true });
  });
}

module.exports = {
  MAX_RETRIES,
  REQUEST_TIMEOUT_MS,
  callChat,
  callEmbeddings,
  deploymentUrl,
  postAzure
};
