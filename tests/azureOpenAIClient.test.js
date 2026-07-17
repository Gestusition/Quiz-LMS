const { callChat } = require('../services/azureOpenAIClient');
const { toErrorResponse } = require('../utils/appError');

const API_KEY = 'provider-key-must-remain-private';
const PROVIDER_BODY = `provider diagnostics containing ${API_KEY}`;
const config = {
  endpoint: 'https://unit-test.openai.azure.com',
  apiKey: API_KEY,
  chatDeployment: 'quiz-chat',
  apiVersion: '2024-10-21'
};
const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    ok: { type: 'boolean' }
  },
  required: ['ok']
};

function providerFailure(status) {
  return {
    ok: false,
    status,
    headers: { get: jest.fn(() => null) },
    json: jest.fn(() => {
      throw new Error('A failed provider response body must not be parsed.');
    }),
    text: jest.fn(async () => PROVIDER_BODY)
  };
}

function providerSuccess(content = '{"ok":true}') {
  return {
    ok: true,
    status: 200,
    json: jest.fn(async () => ({
      choices: [{ message: { content } }]
    }))
  };
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Azure OpenAI chat compatibility fallback', () => {
  test('retries one HTTP 400 with a safe JSON-mode payload', async () => {
    const fetchMock = jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce(providerFailure(400))
      .mockResolvedValueOnce(providerSuccess());

    await expect(callChat(
      [{ role: 'user', content: 'Return JSON.' }],
      config,
      {
        responseSchema: schema,
        schemaName: 'compatibility_test',
        maxTokens: 321,
        temperature: 0.2
      }
    )).resolves.toBe('{"ok":true}');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const firstPayload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(firstPayload).toMatchObject({
      max_tokens: 321,
      temperature: 0.2,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'compatibility_test',
          strict: true,
          schema
        }
      }
    });
    expect(firstPayload).not.toHaveProperty('max_completion_tokens');

    const fallbackPayload = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(fallbackPayload).toEqual({
      messages: [{ role: 'user', content: 'Return JSON.' }],
      max_completion_tokens: 321,
      response_format: { type: 'json_object' }
    });
    expect(JSON.stringify(fallbackPayload)).not.toContain(API_KEY);
  });

  test('does not compatibility-retry credential failures', async () => {
    const fetchMock = jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce(providerFailure(401));

    await expect(callChat(
      [{ role: 'user', content: 'Return JSON.' }],
      config,
      { responseSchema: schema }
    )).rejects.toMatchObject({
      status: 502,
      error: 'Azure OpenAI request failed',
      providerStatus: 401
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('keeps provider diagnostics and credentials out of failure responses', async () => {
    const firstFailure = providerFailure(400);
    const fallbackFailure = providerFailure(400);
    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce(firstFailure)
      .mockResolvedValueOnce(fallbackFailure);

    let caught;
    try {
      await callChat(
        [{ role: 'user', content: 'Return JSON.' }],
        config,
        { responseSchema: schema }
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toMatchObject({ providerStatus: 400 });
    expect(Object.keys(caught)).not.toContain('providerStatus');
    const response = toErrorResponse(caught);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain(API_KEY);
    expect(serialized).not.toContain(PROVIDER_BODY);
    expect(firstFailure.text).not.toHaveBeenCalled();
    expect(firstFailure.json).not.toHaveBeenCalled();
    expect(fallbackFailure.text).not.toHaveBeenCalled();
    expect(fallbackFailure.json).not.toHaveBeenCalled();
  });
});
