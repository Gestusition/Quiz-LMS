const { conflictError, notFoundError } = require('../utils/appError');

const activeGenerations = new Map();

function begin(conversationId, ownerUserId, runId) {
  const key = Number(conversationId);
  if (activeGenerations.has(key)) {
    throw conflictError('generation', 'A quiz draft is already being generated for this conversation.');
  }
  const controller = new AbortController();
  const state = {
    conversationId: key,
    ownerUserId: Number(ownerUserId),
    runId: Number(runId),
    controller,
    stage: 'validating_quiz_plan',
    startedAt: new Date().toISOString()
  };
  activeGenerations.set(key, state);
  return state;
}

function updateStage(conversationId, stage) {
  const state = activeGenerations.get(Number(conversationId));
  if (state) state.stage = stage;
  return state || null;
}

function cancel(conversationId, ownerUserId) {
  const state = activeGenerations.get(Number(conversationId));
  if (!state) throw notFoundError('No active generation was found for this conversation.');
  if (Number(state.ownerUserId) !== Number(ownerUserId)) {
    throw notFoundError('No active generation was found for this conversation.');
  }
  state.stage = 'cancelling';
  state.controller.abort();
  return { runId: state.runId, cancelled: true };
}

function finish(conversationId, runId) {
  const key = Number(conversationId);
  const state = activeGenerations.get(key);
  if (state && (!runId || Number(state.runId) === Number(runId))) {
    activeGenerations.delete(key);
  }
}

function get(conversationId, ownerUserId) {
  const state = activeGenerations.get(Number(conversationId));
  if (!state || (ownerUserId && Number(state.ownerUserId) !== Number(ownerUserId))) return null;
  return {
    conversationId: state.conversationId,
    runId: state.runId,
    stage: state.stage,
    startedAt: state.startedAt
  };
}

function reset() {
  activeGenerations.forEach(state => state.controller.abort());
  activeGenerations.clear();
}

module.exports = { begin, cancel, finish, get, reset, updateStage };
