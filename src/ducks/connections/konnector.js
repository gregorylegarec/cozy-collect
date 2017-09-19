import {
  CREATE_CONNECTION,
  UPDATE_CONNECTION_ERROR,
  UPDATE_CONNECTION_RUNNING_STATUS
} from './'

import account, {
  hasError as hasAccountError,
  hasRun,
  isRunning
} from './account'

const reducer = (state = {}, action) => {
  switch (action.type) {
    case CREATE_CONNECTION:
    case UPDATE_CONNECTION_ERROR:
    case UPDATE_CONNECTION_RUNNING_STATUS:
      return { ...state, [action.account._id]: account(state[action.account._id], action) }
    default:
      return state
  }
}

export default reducer

// selectors
export const getConnectionStatus = (state) => {
  return Object.keys(state).reduce((status, accountId) => {
    if (hasError(state[accountId])) return 'error'
    if (isRunning(state[accountId])) return 'running'
    if (hasRun(state[accountId])) return 'done'
  }, 'running')
}

export const hasError = (state) => {
  return Object.keys(state).find(accountId => hasAccountError(state[accountId]))
}

export const hasRunConnection = (state) => {
  return Object.keys(state).find(accountId => hasRun(state[accountId]))
}

export const hasRunningConnection = (state) => {
  return Object.keys(state).find(accountId => isRunning(state[accountId]))
}
