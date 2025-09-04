/**
 * Lead Entity
 *
 * Represents a potential customer in the marketing domain.
 * Follows Domain-Driven Design principles with immutable value objects.
 *
 * @module MarketingDomain
 * @category Entities
 */

import { Email } from '../value-objects/email';
import { PhoneNumber } from '../value-objects/phone-number';

/**
 * Unique identifier type for a Lead, preventing unintended assignments
 * @typedef {string} LeadId
 */
export type LeadId = string & { readonly __brand: unique symbol };

/**
 * Enumeration of possible lead sources for tracking marketing channels
 * @typedef {string} LeadSource
 */
export type LeadSource =
  | 'website-form'
  | 'demo-request'
  | 'newsletter-signup'
  | 'pricing-inquiry'
  | 'contact-form';

/**
 * Enumeration of lead lifecycle status
 * @typedef {string} LeadStatus
 */
export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'converted'
  | 'lost';

/**
 * Immutable interface representing a potential customer
 * @interface
 */
export interface Lead {
  /** Unique identifier for the lead */
  readonly id: LeadId;
  /** Contact email address */
  readonly email: Email;
  /** Optional phone number */
  readonly phoneNumber?: PhoneNumber;
  /** Optional company name */
  readonly companyName?: string;
  /** Optional first name */
  readonly firstName?: string;
  /** Optional last name */
  readonly lastName?: string;
  /** Source of the lead */
  readonly source: LeadSource;
  /** Current status of the lead */
  readonly status: LeadStatus;
  /** Timestamp of lead creation */
  readonly createdAt: Date;
  /** Timestamp of last update */
  readonly updatedAt: Date;
  /** Optional notes about the lead */
  readonly notes?: string;
  /** Optional list of features the lead is interested in */
  readonly interestedFeatures?: string[];
}

/**
 * Generates a unique lead identifier
 * @returns {LeadId} A new unique lead ID
 */
export function createLeadId(): LeadId {
  return crypto.randomUUID() as LeadId;
}

/**
 * Creates a new Lead with default initialization
 *
 * @param {Object} params - Parameters for creating a lead
 * @param {Email} params.email - Email address of the lead
 * @param {PhoneNumber} [params.phoneNumber] - Optional phone number
 * @param {string} [params.companyName] - Optional company name
 * @param {string} [params.firstName] - Optional first name
 * @param {string} [params.lastName] - Optional last name
 * @param {LeadSource} params.source - Source of the lead
 * @param {string[]} [params.interestedFeatures] - Optional interested features
 * @param {string} [params.notes] - Optional notes
 *
 * @returns {Lead} A new lead instance
 */
export function createLead(params: {
  email: Email;
  phoneNumber?: PhoneNumber;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  source: LeadSource;
  interestedFeatures?: string[];
  notes?: string;
}): Lead {
  const now = new Date();

  return {
    id: createLeadId(),
    email: params.email,
    phoneNumber: params.phoneNumber,
    companyName: params.companyName?.trim(),
    firstName: params.firstName?.trim(),
    lastName: params.lastName?.trim(),
    source: params.source,
    status: 'new',
    createdAt: now,
    updatedAt: now,
    notes: params.notes?.trim(),
    interestedFeatures: params.interestedFeatures || [],
  };
}

/**
 * Updates the status of a lead, creating a new immutable instance
 *
 * @param {Lead} lead - The original lead
 * @param {LeadStatus} newStatus - The new status to set
 * @returns {Lead} A new lead instance with updated status
 */
export function updateLeadStatus(lead: Lead, newStatus: LeadStatus): Lead {
  return {
    ...lead,
    status: newStatus,
    updatedAt: new Date(),
  };
}

/**
 * Adds notes to a lead, creating a new immutable instance
 *
 * @param {Lead} lead - The original lead
 * @param {string} additionalNotes - Notes to append
 * @returns {Lead} A new lead instance with updated notes
 */
export function addLeadNotes(lead: Lead, additionalNotes: string): Lead {
  const existingNotes = lead.notes || '';
  const separator = existingNotes ? '\n---\n' : '';

  return {
    ...lead,
    notes: existingNotes + separator + additionalNotes.trim(),
    updatedAt: new Date(),
  };
}

/**
 * Retrieves the full name of a lead, with fallback to email username
 *
 * @param {Lead} lead - The lead to get the full name for
 * @returns {string} Full name or email username
 */
export function getLeadFullName(lead: Lead): string {
  const firstName = lead.firstName || '';
  const lastName = lead.lastName || '';

  if (!firstName && !lastName) {
    return lead.email.split('@')[0]; // Fallback to email username
  }

  return [firstName, lastName].filter(Boolean).join(' ').trim();
}