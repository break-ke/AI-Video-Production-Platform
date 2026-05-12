import type { CompetitiveResearch, Storyboard, Feedback, ScriptVersion, ModelAdaptation, EditingTask, ReplicateTemplate } from "@/types";
import { mockCompetitiveResearch } from "@/lib/mock/competitive-research";
import { mockStoryboards } from "@/lib/mock/storyboard";
import { mockFeedbacks } from "@/lib/mock/feedback";
import { mockScriptVersions } from "@/lib/mock/script-iteration";
import { mockModelAdaptations } from "@/lib/mock/model-adaptation";
import { mockEditingTasks } from "@/lib/mock/auto-editing";
import { mockTemplates } from "@/lib/mock/one-click-replicate";

// ---- Generic helpers ----

function crud<T extends { id: string }>(initial: T[]) {
  const items: T[] = [...initial];
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

// ---- Stores ----

export const competitiveResearch = crud<CompetitiveResearch>(mockCompetitiveResearch);
export const storyboards = crud<Storyboard>(mockStoryboards);
export const feedbacks = crud<Feedback>(mockFeedbacks);
export const scriptVersions = crud<ScriptVersion>(mockScriptVersions);
export const modelAdaptations = crud<ModelAdaptation>(mockModelAdaptations);
export const editingTasks = crud<EditingTask>(mockEditingTasks);
export const templates = crud<ReplicateTemplate>(mockTemplates);
