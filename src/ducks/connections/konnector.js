import {
  CREATE_CONNECTION,
  ENQUEUE_CONNECTION,
  PURGE_QUEUE,
  UPDATE_CONNECTION_ERROR,
  UPDATE_CONNECTION_RUNNING_STATUS
} from './'

import account, {
  hasError as hasAccountError,
  hasRun,
  isQueued,
  isRunning
} from './account'

const reducer = (state = {}, action) => {
  switch (action.type) {
    case CREATE_CONNECTION:
    case ENQUEUE_CONNECTION:
    case UPDATE_CONNECTION_ERROR:
    case UPDATE_CONNECTION_RUNNING_STATUS:
      return { ...state, [action.account._id]: account(state[action.account._id], action) }
    case PURGE_QUEUE:
      return Object.keys(state).reduce((accounts, accountId) => {
        return { ...accounts, [accountId]: account(state[accountId], action) }
      }, state)
    default:
      return state
  }
}

export default reducer

// selectors
export const getConnectionStatus = (state) => {
  return Object.keys(state).reduce((status, accountId) => {
    if (hasAccountError(state[accountId])) return 'error'
    if (isRunning(state[accountId])) return 'ongoing'
    if (hasRun(state[accountId])) return 'done'
  }, 'pending')
}

export const hasError = (state) => {
  return Object.keys(state).find(accountId => hasAccountError(state[accountId]))
}

export const hasQueuedConnection = (state) => {
  return Object.keys(state).find(accountId => isQueued(state[accountId]))
}

export const hasRunConnection = (state) => {
  return Object.keys(state).find(accountId => hasRun(state[accountId]))
}

export const hasRunningConnection = (state) => {
  return Object.keys(state).find(accountId => isRunning(state[accountId]))
}
