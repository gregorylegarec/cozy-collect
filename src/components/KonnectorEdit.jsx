import React from 'react'
import has from 'lodash/has'

import { TriggerManager, withKonnectorModal } from 'cozy-harvest-lib'
import { translate } from 'cozy-ui/react/I18n'
import { Tab, Tabs, TabList, TabPanels, TabPanel } from 'cozy-ui/react/Tabs'

import warningSvg from 'assets/sprites/icon-warning.svg'
import AccountConnectionData from 'components/AccountConnectionData'
import AccountLogout from 'components/AccountLogout'
import DescriptionContent from 'components/DescriptionContent'
import ErrorMessage from 'components/Banners/ErrorMessage'
import KonnectorMaintenance from 'components/KonnectorMaintenance'
import KonnectorSync from 'components/KonnectorSync'
import TriggerFolderLink from 'components/TriggerFolderLink'
import styles from 'styles/konnectorEdit'
import { getKonnectorMessage, isKonnectorLoginError } from 'lib/konnectors'

export const KonnectorEdit = props => {
  const {
    t,
    account,
    connector,
    error,
    lastSuccess,
    onDeleteError,
    onDeleteSuccess,
    submitting,
    trigger,
    maintenance,
    lang
  } = props

  const warningIcon = (
    <svg className={styles['item-status-icon']}>
      <use xlinkHref={`#${warningSvg.id}`} />
    </svg>
  )
  const hasLoginError = isKonnectorLoginError(error)
  const hasErrorExceptLogin = !!error && !hasLoginError

  return (
    <div className={styles['col-account-edit-content']}>
      {!maintenance &&
        trigger &&
        !!error && (
          <ErrorMessage
            konnector={connector}
            error={error}
            isKonnectorRunning={submitting}
            trigger={trigger}
          />
        )}

      <Tabs
        initialActiveTab={hasLoginError ? 'account' : 'sync'}
        className={styles['col-account-edit-tabs']}
      >
        <TabList>
          <Tab name="sync" className={styles['col-account-edit-tab']}>
            {t('account.config.tabs.sync')}
            {hasErrorExceptLogin && warningIcon}
          </Tab>
          <Tab name="account" className={styles['col-account-edit-tab']}>
            {t('account.config.tabs.account')}
            {hasLoginError && warningIcon}
          </Tab>
          <Tab name="data" className={styles['col-account-edit-tab']}>
            {t('account.config.tabs.data')}
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel name="sync" className={styles['col-account-edit-tabpanel']}>
            {maintenance &&
              maintenance.longTerm && (
                <KonnectorMaintenance
                  maintenance={maintenance}
                  lang={lang}
                  konnectorName={connector.name}
                />
              )}
            <KonnectorSync
              frequency={connector.frequency || 'weekly'}
              lastSuccessDate={lastSuccess}
              maintenance={maintenance}
              submitting={submitting}
              trigger={trigger}
            />
            {has(trigger, 'message.folder_to_save') && (
              <DescriptionContent
                title={t('account.folder.withoutSettings.title')}
              >
                <p className="u-mv-half">
                  <TriggerFolderLink
                    folderId={trigger.message.folder_to_save}
                    label={t('account.folder.link')}
                  />
                </p>
              </DescriptionContent>
            )}
          </TabPanel>

          <TabPanel
            name="account"
            className={styles['col-account-edit-tabpanel']}
          >
            <DescriptionContent
              messages={[getKonnectorMessage(t, connector, 'terms')]}
            />
            <TriggerManager
              account={account}
              konnector={connector}
              showError={false}
              trigger={trigger}
              running={submitting}
            />
            {
              <AccountLogout
                account={account}
                onError={onDeleteError}
                onSuccess={onDeleteSuccess}
              />
            }
          </TabPanel>

          <TabPanel name="data" className={styles['col-account-edit-tabpanel']}>
            <AccountConnectionData connector={connector} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  )
}

export default translate()(withKonnectorModal(KonnectorEdit))
