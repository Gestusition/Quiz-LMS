const { AppError } = require('../utils/appError');

const REQUEST_TIMEOUT_MS = 45000;

function deploymentUrl(config, deployment, operation) {
  return `${config.endpoint}/openai/deployments/${encodeURIComponent(deployment)}/${operation}?api-version=${encodeURIComponent(config.apiVersion)}`;
}

async function postAzure(url, payload, config) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': config.apiKey },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    if (!response.ok) {
      throw new AppError({
        status: response.status === 429 ? 429 : 502,
        error: 'Azure OpenAI request failed',
        message: response.status === 401 || response.status === 403
          ? 'Azure OpenAI rejected the credentials. Check your private AI settings.'
          : `Azure OpenAI returned status ${response.status}. Check the endpoint, deployment, and API version.`
      });
    }
    return await response.json();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError({
      status: 502,
      error: 'Azure OpenAI unavailable',
      message: error?.name === 'AbortError'
        ? 'Azure OpenAI timed out. Try again with a smaller request.'
        : 'Azure OpenAI could not be reached. Check your endpoint and network connection.'
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function callChat(messages, config, options = {}) {
  const data = await postAzure(
    deploymentUrl(config, config.chatDeployment, 'chat/completions'),
    {
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 6000,
      response_format: { type: 'json_object' }
    },
    config
  );
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new AppError({ status: 502, error: 'Invalid AI response', message: 'Azure OpenAI returned no usable content.' });
  }
  return content;
}

async function callEmbeddings(inputs, config) {
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
    config
  );
  const ordered = Array.isArray(data?.data) ? [...data.data].sort((a, b) => a.index - b.index) : [];
  if (ordered.length !== inputs.length || ordered.some(item => !Array.isArray(item.embedding))) {
    throw new AppError({ status: 502, error: 'Invalid embedding response', message: 'Azure OpenAI returned incomplete embeddings.' });
  }
  return ordered.map(item => item.embedding);
}

module.exports = { callChat, callEmbeddings };
