import React, { Component } from 'react'
import { cozyConnect } from 'redux-cozy-client'
import { connect } from 'react-redux'
import { NavLink, withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'

import { translate } from 'cozy-ui/react/I18n'
import Alerter from 'cozy-ui/react/Alerter'
import { KonnectorModal } from 'cozy-harvest-lib'
import Icon from 'cozy-ui/react/Icon'
import Modal, { ModalContent, ModalHeader } from 'cozy-ui/react/Modal'

import backIcon from 'assets/sprites/icon-arrow-left.svg'
import AccountConnection from 'containers/AccountConnection'
import KonnectorHeaderIcon from 'components/KonnectorHeaderIcon'
import { getAccount } from 'ducks/accounts'
import {
  endConnectionCreation,
  getTriggerLastSuccess,
  isConnectionRunning,
  isCreatingConnection,
  startConnectionCreation
} from 'ducks/connections'
import { getKonnector } from 'ducks/konnectors'
import {
  getConnectionsByKonnector,
  getCreatedConnectionAccount,
  getTriggerByKonnectorAndAccount,
  getKonnectorsInMaintenance
} from 'reducers'
import styles from 'styles/connectionManagement.styl'

class ConnectionManagement extends Component {
  constructor(props, context) {
    super(props, context)
    this.store = context.store
    const { konnector } = props

    this.state = {
      isSuccess: false
    }

    if (konnector) {
      this.store.fetchUrls()
      if (this.props.isCreating) {
        // eslint-disable-next-line no-console
        console.warn(
          'Unexpected state: connection creation already in progress'
        )
      } else {
        this.props.startCreation()
      }
    } else {
      return this.gotoParent()
    }

    this.handleDeleteSuccess = this.handleDeleteSuccess.bind(this)
  }

  componentWillReceiveProps(props) {
    this.UNSAFE_componentWillReceiveProps(props)
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const isInvalidKonnectorSlug =
      nextProps.match &&
      nextProps.match.params.konnectorSlug &&
      !nextProps.konnector

    if (isInvalidKonnectorSlug) {
      // eslint-disable-next-line no-console
      console.warn('Invalid konnector slug')
      return this.gotoParent()
    }

    const isInvalidAccountId =
      nextProps.match &&
      // an account id is provided but not existingAccount
      nextProps.match.params.accountId &&
      !nextProps.existingAccount &&
      // we check that it was not a deletion
      !this.props.existingAccount
    if (isInvalidAccountId) {
      // eslint-disable-next-line no-console
      console.warn('Invalid account id')
      return this.gotoParent()
    }
  }

  render() {
    const {
      connections,
      createdAccount,
      existingAccount,
      konnector
    } = this.props
    // Do not even render if there is no konnector (in case of wrong URL)
    if (!konnector) return

    const { isSuccess } = this.state

    const backRoute = connections.length
      ? `/connected/${konnector.slug}`
      : '/connected'

    const editing = existingAccount && !createdAccount
    const isInstallSuccess = !editing && isSuccess
    return (
      <KonnectorModal
        dismissAction={() => this.gotoParent()}
        konnector={konnector}
        className={styles['col-account-modal']}
      />
    )
  }

  handleDeleteSuccess() {
    const { t } = this.props
    Alerter.success(t('account.message.success.delete'))
    this.gotoParent()
  }

  onEnd = () => {
    const { endCreation, isCreating } = this.props
    if (isCreating) {
      typeof endCreation === 'function' && endCreation()
    }
  }

  handleConnectionSuccess = () => {
    this.setState({ isSuccess: true })
  }

  gotoParent() {
    // The setTimeout allows React to perform setState related actions
    setTimeout(() => {
      const { originPath, history } = this.props

      if (originPath) {
        const params = this.props.match.params
        const resolvedOriginPath = Object.keys(params)
          .filter(param => typeof params[param] === 'string')
          // Sort params from longest string to shortest string to avoid
          // unexpected replacements like :test in :test2.
          .sort(
            (a, b) => (a.length === b.length ? 0 : a.length > b.length ? -1 : 1)
          )
          .reduce(
            (path, param) => path.replace(`:${param}`, params[param]),
            originPath
          )
        history.push(resolvedOriginPath)
      } else {
        let url = history.location.pathname
        history.push(url.substring(0, url.lastIndexOf('/')))
      }

      if (this.props.isCreating) {
        this.props.endCreation()
      }
    }, 0)
  }
}

ConnectionManagement.contextTypes = {
  store: PropTypes.object
}

const mapActionsToProps = () => ({})

const mapStateToProps = (state, ownProps) => {
  // infos from route parameters
  const { accountId, konnectorSlug } = ownProps.match && ownProps.match.params
  const konnector = getKonnector(state.cozy, konnectorSlug)
  const existingAccount = getAccount(state.cozy, accountId)
  const createdAccount = getCreatedConnectionAccount(state)
  const trigger = getTriggerByKonnectorAndAccount(
    state,
    konnector,
    existingAccount || createdAccount
  )
  const maintenance = getKonnectorsInMaintenance()
  return {
    connections: getConnectionsByKonnector(state, konnectorSlug),
    createdAccount,
    existingAccount,
    isCreating: isCreatingConnection(state.connections),
    konnector: { ...konnector, triggers: { data: [trigger] } },
    isRunning: isConnectionRunning(state.connections, trigger),
    lastSuccess: getTriggerLastSuccess(state.cozy, trigger),
    trigger,
    maintenance: maintenance
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  startCreation: () => dispatch(startConnectionCreation(ownProps.konnector)),
  endCreation: () => dispatch(endConnectionCreation())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  cozyConnect(() => {}, mapActionsToProps)(
    withRouter(translate()(ConnectionManagement))
  )
)
