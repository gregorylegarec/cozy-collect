import React, { Component } from 'react'

import { translate } from 'cozy-ui/react/I18n'
import AppIcon from 'cozy-ui/react/AppIcon'
import { fetchIcon } from 'lib/icons'

export class AppTile extends Component {
  render() {
    const { app, t } = this.props
    const { client } = this.context
    const displayName = app.name_prefix
      ? `${app.name_prefix} ${app.name}`
      : app.name
    return (
      <a className="item-wrapper" href={app.links && app.links.related}>
        <div className="item-icon">
          <AppIcon
            alt={t('app.logo.alt', { name: displayName })}
            app={app}
            fetchIcon={fetchIcon(client)}
          />
        </div>
        <h3 className="item-title">{displayName}</h3>
      </a>
    )
  }
}

export default translate()(AppTile)
