import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AiClient } from '../client';
import { AiSettingsInput } from '../types';
import { Modal } from './Modal';

interface AzureSettingsDialogProps {
  client: AiClient;
  onClose: () => void;
  onToast: (message: string, type?: 'info' | 'success' | 'error') => void;
}

const EMPTY_SETTINGS: AiSettingsInput = {
  endpoint: '',
  apiKey: '',
  chatDeployment: '',
  embeddingDeployment: '',
  apiVersion: ''
};

function connectionMessage(value: unknown, deployment: 'Chat' | 'Embedding'): string {
  if (typeof value === 'boolean') {
    return value
      ? `${deployment} deployment connected.`
      : `${deployment} deployment failed.`;
  }
  if (!value || typeof value !== 'object') return '';

  const result = value as { ok?: unknown; skipped?: unknown; message?: unknown };
  if (typeof result.message === 'string' && result.message.trim()) {
    return result.message.trim();
  }
  if (result.skipped === true) return `${deployment} deployment was skipped.`;
  return result.ok === true
    ? `${deployment} deployment connected.`
    : `${deployment} deployment failed.`;
}

export function AzureSettingsDialog({ client, onClose, onToast }: AzureSettingsDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AiSettingsInput>(EMPTY_SETTINGS);
  const [testResult, setTestResult] = useState('');
  const statusQuery = useQuery({
    queryKey: ['ai', 'settings'],
    queryFn: client.getSettings
  });

  useEffect(() => {
    const status = statusQuery.data;
    if (!status) return;
    setForm(current => ({
      ...current,
      endpoint: status.endpoint,
      chatDeployment: status.chatDeployment,
      embeddingDeployment: status.embeddingDeployment,
      apiVersion: status.apiVersion
    }));
  }, [statusQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () => client.saveSettings(form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ai', 'settings'] });
      onToast('Private Azure settings saved.', 'success');
      onClose();
    },
    onError: error => onToast(error instanceof Error ? error.message : 'Could not save Azure settings.', 'error')
  });

  const testMutation = useMutation({
    mutationFn: () => client.testSettings(form),
    onSuccess: result => {
      const chat = connectionMessage(result.chat, 'Chat');
      const embeddings = connectionMessage(result.embeddings, 'Embedding');
      setTestResult([chat, embeddings].filter(Boolean).join(' '));
    },
    onError: error => setTestResult(error instanceof Error ? error.message : 'Connection test failed.')
  });

  const update = (key: keyof AiSettingsInput, value: string) => {
    setForm(current => ({ ...current, [key]: value }));
    setTestResult('');
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  const configured = statusQuery.data?.configured ?? false;

  return (
    <Modal
      title="Private Azure settings"
      description="Credentials stay on the LMS server. Saved API keys are never returned to this browser."
      onClose={onClose}
    >
      {statusQuery.isLoading ? <p role="status">Loading settings…</p> : null}
      {statusQuery.isError ? (
        <div className="aiw-inline-error" role="alert">
          <span>Settings could not be loaded.</span>
          <button type="button" onClick={() => statusQuery.refetch()}>Retry</button>
        </div>
      ) : null}
      <form className="aiw-dialog-form" onSubmit={submit}>
        <label className="aiw-field">
          <span>Azure endpoint</span>
          <input
            type="url"
            required
            value={form.endpoint}
            onChange={event => update('endpoint', event.target.value)}
            placeholder="https://your-resource.openai.azure.com"
          />
        </label>
        <label className="aiw-field">
          <span>
            API key
            {statusQuery.data?.maskedApiKey ? <small>saved · {statusQuery.data.maskedApiKey}</small> : null}
          </span>
          <input
            type="password"
            autoComplete="new-password"
            required={!configured}
            value={form.apiKey}
            onChange={event => update('apiKey', event.target.value)}
            placeholder={configured ? 'Leave blank to keep saved key' : 'Enter your private key'}
          />
        </label>
        <div className="aiw-field-row">
          <label className="aiw-field">
            <span>Chat deployment</span>
            <input required value={form.chatDeployment} onChange={event => update('chatDeployment', event.target.value)} />
          </label>
          <label className="aiw-field">
            <span>Embedding deployment</span>
            <input
              value={form.embeddingDeployment}
              onChange={event => update('embeddingDeployment', event.target.value)}
              placeholder="Required for materials"
            />
          </label>
        </div>
        <label className="aiw-field">
          <span>API version</span>
          <input
            required
            value={form.apiVersion}
            onChange={event => update('apiVersion', event.target.value)}
            placeholder="2024-10-21"
          />
        </label>
        <div className="aiw-security-note">
          <strong>Private by design</strong>
          <span>Azure calls run on the backend. The browser receives configuration status only.</span>
        </div>
        {testResult ? <p className="aiw-test-result" role="status">{testResult}</p> : null}
        <div className="aiw-dialog-actions aiw-dialog-actions--split">
          <button
            className="aiw-button aiw-button--quiet"
            type="button"
            onClick={() => testMutation.mutate()}
            disabled={testMutation.isPending || !form.endpoint || !form.chatDeployment || !form.apiVersion}
          >
            {testMutation.isPending ? 'Testing…' : 'Test connection'}
          </button>
          <div>
            <button className="aiw-button aiw-button--quiet" type="button" onClick={onClose}>Cancel</button>
            <button className="aiw-button aiw-button--primary" type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
