/**
 * Lead Entity
 * Domain layer - Core business entity representing a potential customer
 */

import { Email } from '../value-objects/email';
import { PhoneNumber } from '../value-objects/phone-number';

export type LeadId = string & { readonly __brand: unique symbol };

export type LeadSource = 
  | 'website-form'
  | 'demo-request' 
  | 'newsletter-signup'
  | 'pricing-inquiry'
  | 'contact-form';

export type LeadStatus = 
  | 'new'
  | 'contacted' 
  | 'qualified'
  | 'converted'
  | 'lost';

export interface Lead {
  readonly id: LeadId;
  readonly email: Email;
  readonly phoneNumber?: PhoneNumber;
  readonly companyName?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly source: LeadSource;
  readonly status: LeadStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly notes?: string;
  readonly interestedFeatures?: string[];
}

export function createLeadId(): LeadId {
  return crypto.randomUUID() as LeadId;
}

/**
 * Pure function to create a new Lead
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
 * Pure function to update lead status
 */
export function updateLeadStatus(lead: Lead, newStatus: LeadStatus): Lead {
  return {
    ...lead,
    status: newStatus,
    updatedAt: new Date(),
  };
}

/**
 * Pure function to add notes to a lead
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
 * Pure function to get full name
 */
export function getLeadFullName(lead: Lead): string {
  const firstName = lead.firstName || '';
  const lastName = lead.lastName || '';
  
  if (!firstName && !lastName) {
    return lead.email.split('@')[0]; // Fallback to email username
  }
  
  return [firstName, lastName].filter(Boolean).join(' ').trim();
}