import type { CompetitiveResearch, Storyboard, Feedback, ScriptVersion, ModelAdaptation, EditingTask, ReplicateTemplate } from "@/types";
import { mockCompetitiveResearch } from "@/lib/mock/competitive-research";
import { mockStoryboards } from "@/lib/mock/storyboard";
import { mockFeedbacks } from "@/lib/mock/feedback";
import { mockScriptVersions } from "@/lib/mock/script-iteration";
import { mockModelAdaptations } from "@/lib/mock/model-adaptation";
import { mockEditingTasks } from "@/lib/mock/auto-editing";
import { mockTemplates } from "@/lib/mock/one-click-replicate";

// Use globalThis for shared state across Next.js API route chunks
const g = globalThis as Record<string, unknown>;

function crud<T extends { id: string }>(key: string, initial: T[]) {
  if (!g[key]) {
    g[key] = [...initial];
  }
  const items = g[key] as T[];
  return {
    getAll: () => items,
    getById: (id: string) => items.find((i) => i.id === id),
    add: (item: T) => { items.unshift(item); },
    remove: (id: string) => {
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) return false;
      items.splice(idx, 1);
      return true;
    },
    update: (id: string, fields: Partial<T>) => {
      const item = items.find((i) => i.id === id);
      if (!item) return null;
      Object.assign(item, fields);
      return item;
    },
  };
}

export const competitiveResearch = crud<CompetitiveResearch>("__store_cr", mockCompetitiveResearch);
export const storyboards = crud<Storyboard>("__store_sb", mockStoryboards);
export const feedbacks = crud<Feedback>("__store_fb", mockFeedbacks);
export const scriptVersions = crud<ScriptVersion>("__store_sv", mockScriptVersions);
export const modelAdaptations = crud<ModelAdaptation>("__store_ma", mockModelAdaptations);
export const editingTasks = crud<EditingTask>("__store_et", mockEditingTasks);
export const templates = crud<ReplicateTemplate>("__store_tp", mockTemplates);
