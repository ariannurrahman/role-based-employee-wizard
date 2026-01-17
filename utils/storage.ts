import { Draft, Role } from '@/types';

const DRAFT_KEYS = {
  admin: 'draft_admin',
  ops: 'draft_ops',
} as const;

export function saveDraft(role: Role, draft: Draft): void {
  try {
    localStorage.setItem(DRAFT_KEYS[role], JSON.stringify(draft));
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
}

export function loadDraft(role: Role): Draft | null {
  try {
    const data = localStorage.getItem(DRAFT_KEYS[role]);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

export function clearDraft(role: Role): void {
  try {
    localStorage.removeItem(DRAFT_KEYS[role]);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
}
