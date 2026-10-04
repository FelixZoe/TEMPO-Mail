/*
 * SPDX-FileCopyrightText: 2020 Stalwart Labs LLC <hello@stalw.art>
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-SEL
 */

import type { JmapSetError, ValidationError } from '@/types/jmap';
import i18n from '@/i18n';

export function validationErrorMessage(ve: ValidationError): string {
  switch (ve.type) {
    case 'Required':
      return i18n.t('form.required', 'This field is required.');
    case 'MaxLength':
      return i18n.t('form.maxLengthIs', 'Maximum length is {{max}}.', { max: ve.required });
    case 'MinLength':
      return i18n.t('form.minLengthIs', 'Minimum length is {{min}}.', { min: ve.required });
    case 'MaxValue':
      return i18n.t('form.maxValueIs', 'Maximum value is {{max}}.', { max: ve.required });
    case 'MinValue':
      return i18n.t('form.minValueIs', 'Minimum value is {{min}}.', { min: ve.required });
    default:
      if (ve.value && ve.value.length > 0) return ve.value;
      return i18n.t('form.invalidValue', 'Invalid value.');
  }
}

export function friendlySetError(err: JmapSetError): string {
  if (err.description) return err.description;
  switch (err.type) {
    case 'forbidden':
      return i18n.t('jmapErrors.forbidden', 'You do not have permission to perform this action.');
    case 'notFound':
      return i18n.t('jmapErrors.notFound', 'The item was not found. It may have been already deleted.');
    case 'objectIsLinked':
      return i18n.t('jmapErrors.objectIsLinked', 'This item is referenced by other items and cannot be deleted.');
    case 'invalidForeignKey':
      return i18n.t('jmapErrors.invalidForeignKey', 'This item references another item that does not exist.');
    case 'primaryKeyViolation':
      return i18n.t('jmapErrors.primaryKeyViolation', 'An item with the same key already exists.');
    case 'alreadyExists':
      return i18n.t('jmapErrors.alreadyExists', 'An item with the same identifier already exists.');
    case 'overQuota':
      return i18n.t('jmapErrors.overQuota', 'The operation exceeds your storage quota.');
    case 'tooLarge':
      return i18n.t('jmapErrors.tooLarge', 'The item is too large.');
    case 'rateLimit':
      return i18n.t('jmapErrors.rateLimit', 'Too many requests. Please try again later.');
    case 'singleton':
      return i18n.t('jmapErrors.singleton', 'This item is a singleton and cannot be deleted.');
    case 'mailboxHasChild':
      return i18n.t('jmapErrors.mailboxHasChild', 'This mailbox has child mailboxes. Delete them first.');
    case 'mailboxHasEmail':
      return i18n.t('jmapErrors.mailboxHasEmail', 'This mailbox contains messages. Remove them first.');
    case 'calendarHasEvent':
      return i18n.t('jmapErrors.calendarHasEvent', 'This calendar contains events. Remove them first.');
    case 'addressBookHasContents':
      return i18n.t('jmapErrors.addressBookHasContents', 'This address book has contacts. Remove them first.');
    case 'nodeHasChildren':
      return i18n.t('jmapErrors.nodeHasChildren', 'This item has children. Delete them first.');
    case 'validationFailed':
      return i18n.t('jmapErrors.validationFailed', 'The data did not pass validation.');
    default:
      return i18n.t('jmapErrors.unexpected', 'Unexpected error ({{type}}).', { type: err.type });
  }
}
