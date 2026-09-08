import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_key: string, fallback?: string) => fallback || _key }),
}));

vi.mock("@/components/MermaidView", () => ({
  default: ({ source }: { source: string }) => (
    <div data-mermaid-preview="true" data-source={source} />
  ),
}));

import { MarkdownPreview } from "@/components/MarkdownPreview";

describe("MarkdownPreview interactions", () => {
  it("renders interactive task lists without a duplicate bullet", () => {
    const output = renderToStaticMarkup(
      <MarkdownPreview markdown={"- [ ] pending\n- [x] done"} onTaskCheckboxChange={() => {}} />,
    );

    expect(output).toContain('type="checkbox"');
    expect(output).not.toContain("disabled");
    expect(output).toContain("list-none");
    expect(output).toContain("task-list-item");
  });

  it("keeps ordinary unordered lists styled with bullets", () => {
    const output = renderToStaticMarkup(<MarkdownPreview markdown={"- alpha\n- beta"} />);
    expect(output).toContain("list-disc");
  });

  it("renders fenced code with language metadata, highlighting and copy action", () => {
    const output = renderToStaticMarkup(
      <MarkdownPreview markdown={"```typescript\nconst total: number = 100\n```"} />,
    );

    expect(output).toContain("TypeScript");
    expect(output).toContain("Copy code");
    expect(output).toContain("hljs-keyword");
    expect(output).toContain("overflow-x-auto");
  });

  it("routes fenced Mermaid code to the diagram preview", () => {
    const source = "sequenceDiagram\n  participant C as 客户端<br/>127.0.0.1:5173\n  C->>C: 校验 state";
    const output = renderToStaticMarkup(
      <MarkdownPreview markdown={`\`\`\`mermaid\n${source}\n\`\`\``} />,
    );

    expect(output).toContain('data-mermaid-preview="true"');
    expect(output).toContain("客户端&lt;br/&gt;127.0.0.1:5173");
    expect(output).not.toContain("Copy code");
  });
});
