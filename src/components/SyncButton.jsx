import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import Button from 'cozy-ui/react/Button'
import { withLauncher } from 'cozy-harvest-lib'

export class SyncButton extends PureComponent {
  render() {
    const { launchTrigger, trigger } = this.props
    return <Button {...this.props} onClick={() => launchTrigger(trigger)} />
  }
}

SyncButton.propTypes = {
  /** Provider by triggerLauncher **/
  launchTrigger: PropTypes.func
}

export default withLauncher(SyncButton)
