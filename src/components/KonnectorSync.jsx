import React from 'react'
import DateFns from 'date-fns'

import { translate } from 'cozy-ui/react/I18n'
import Icon from 'cozy-ui/react/Icon'

import DescriptionContent from 'components/DescriptionContent'
import SyncButton from 'components/SyncButton'

function getDateLabel({ date, t, f }) {
  return f(DateFns.parse(date), t('account.message.synced.date_format'))
}

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]
const dows = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const humanCron = cronSpec => {
  try {
    const [, minute, hour, , month, dayOfWeek] = cronSpec.split(' ')
    const timePart =
      hour !== '*' && minute !== '*'
        ? `at ${hour}:${minute}`
        : hour !== '*'
          ? `${hour}h`
          : `Any hour on ${minute}minute`
    const monthPart = month !== '*' ? `during ${months[month]}` : ''
    const dowPart = dayOfWeek !== '*' ? `on ${dows[dayOfWeek]}` : ''
    return [timePart, monthPart, dowPart].join(' ')
  } catch (e) {
    return JSON.stringify(e)
  }
}

export const KonnectorSync = ({
  t,
  f,
  frequency,
  lastSuccessDate,
  maintenance,
  submitting,
  onForceConnection,
  trigger
}) => {
  const lastSyncMessage =
    (submitting && t('account.message.synced.syncing')) ||
    (!lastSuccessDate && t('account.message.synced.unknown')) ||
    (lastSuccessDate && getDateLabel({ date: lastSuccessDate, t, f })) ||
    null
  return (
    <div title={`Scheduled execution : ${humanCron(trigger.arguments)}`}>
      {
        <DescriptionContent
          title={t('account.message.synced.title')}
          messages={[
            lastSyncMessage
              ? t('account.message.synced.last_sync', { date: lastSyncMessage })
              : '',
            t('account.message.synced.cron', {
              frequency: t(`account.message.synced.cron_${frequency}`)
            })
          ]}
        />
      }
      {!maintenance && (
        <SyncButton
          disabled={submitting}
          onClick={onForceConnection}
          label={t('account.forceConnection')}
          subtle
          icon={<Icon focusable="false" icon="sync" spin={submitting} />}
        />
      )}
    </div>
  )
}

export default translate()(KonnectorSync)
