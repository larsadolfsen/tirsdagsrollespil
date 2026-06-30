import type { NpcTemplate } from "../data/npcTypes";
import type { CreatureTemplate } from "../data/rules/wfrp4e/creatureCatalog";
import type { AdversaryEditorType } from "../data/adversaryEditorTypes";

type AdversaryRecordOf<T extends AdversaryEditorType> = T extends "creature" ? CreatureTemplate : NpcTemplate;

const adversaryCatalogEndpoint = (type: AdversaryEditorType) =>
  `/api/adversary-catalog?type=${encodeURIComponent(type)}`;

const adversaryCatalogDeleteEndpoint = (type: AdversaryEditorType, id: string) =>
  `/api/adversary-catalog?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`;

export function isAdversaryEditorAvailable(): boolean {
  return import.meta.env.DEV;
}

export async function listAdversaries<T extends AdversaryEditorType>(
  type: T,
): Promise<AdversaryRecordOf<T>[]> {
  if (!isAdversaryEditorAvailable()) {
    return [];
  }

  const response = await fetch(adversaryCatalogEndpoint(type));
  if (!response.ok) {
    throw new Error(`Could not load ${type} catalog (${response.status}).`);
  }

  const entries = await response.json();
  return Array.isArray(entries) ? (entries as AdversaryRecordOf<T>[]) : [];
}

export async function saveAdversaryCatalog<T extends AdversaryEditorType>(
  type: T,
  entries: AdversaryRecordOf<T>[],
): Promise<void> {
  if (!isAdversaryEditorAvailable()) {
    throw new Error("The adversary editor is only available in local development.");
  }

  const response = await fetch(adversaryCatalogEndpoint(type), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, entries }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Could not save ${type} catalog (${response.status}).`);
  }
}

export async function deleteAdversary(type: AdversaryEditorType, id: string): Promise<void> {
  if (!isAdversaryEditorAvailable()) {
    throw new Error("The adversary editor is only available in local development.");
  }

  const response = await fetch(adversaryCatalogDeleteEndpoint(type, id), {
    method: "DELETE",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Could not delete ${type} entry (${response.status}).`);
  }
}
