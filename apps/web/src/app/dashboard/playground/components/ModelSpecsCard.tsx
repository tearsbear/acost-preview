import type { AIModel } from "@/types/ai-model";

interface ModelSpecsCardProps {
  selectedModel: AIModel | null;
}

export function ModelSpecsCard({ selectedModel }: ModelSpecsCardProps) {
  if (!selectedModel) return null;

  return (
    <div className="mt-3 bg-surface border border-border rounded-md p-3.5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted">
      <div>
        Context:{" "}
        <span className="text-primary font-semibold font-mono">
          {selectedModel.contextLength.toLocaleString() || "N/A"} tokens
        </span>
      </div>
      <div>
        Input:{" "}
        <span className="text-primary font-semibold font-mono">
          ${(selectedModel.inputPrice ?? 0) * 1_000_000}/M tokens
        </span>
      </div>
      <div>
        Output:{" "}
        <span className="text-primary font-semibold font-mono">
          ${(selectedModel.outputPrice ?? 0) * 1_000_000}/M tokens
        </span>
      </div>
      <div className="flex gap-2.5 items-center ml-auto">
        {selectedModel.supportsTools && (
          <span className="px-1.5 py-0.5 bg-canvas border border-border rounded text-[10px] font-medium text-emerald-600">
            Tools
          </span>
        )}
        {selectedModel.supportsVision && (
          <span className="px-1.5 py-0.5 bg-canvas border border-border rounded text-[10px] font-medium text-indigo-600">
            Vision
          </span>
        )}
        {selectedModel.supportsReasoning && (
          <span className="px-1.5 py-0.5 bg-canvas border border-border rounded text-[10px] font-medium text-amber-600">
            Reasoning
          </span>
        )}
      </div>
    </div>
  );
}
