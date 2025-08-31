# Authoring MDX in Storybook (MDX 3)

This short guide covers common authoring patterns for stories in MDX 3.

## Imports

MDX stories use the Storybook MDX blocks:

```mdx
import { Meta, Story, Canvas, ArgsTable, Source } from '@storybook/blocks

'
```

## Basic structure

```mdx
<Meta title="Category/Thing" />

# Thing

Description of this story.

<Canvas>
  <Story name="Default" args={{ foo: "bar" }}>
    {(args) => <Thing {...args} />}
  </Story>
</Canvas>

<ArgsTable of={Thing} />
```

## Patterns

- Canvas + Story: Use Canvas to render a visual region; Story takes a name and optional args.
- ArgsTable: Auto-generates a props table for a component or story.
- Source: Show code snippets alongside stories.

## Naming conventions

- Title: Use a clear, hierarchical path, e.g., `Docs/Swagger UI`, `Components/Layout/Navigation`.
- Story names: "Default", "Mobile", "Error", "Loading" are good, consistent suffixes.

## Controls and Args

- Use `args={{ ... }}` on <Story> and reflect props on your component.
- Expose knobs/controls by declaring argTypes in a CSF file or rely on inference.

## Help panel param

Add a quick link to relevant docs with a story parameter:

```mdx
export const parameters = { repoDocPath: '/docs/status/LOCAL_DEV_GUIDE.md', repoDocLabel: 'Local Dev Guide'

}
```

## MDX lint

- The repo enables MDX lint via ESLint overrides (`plugin:mdx/recommended`).
- Keep headings ordered (use #, ##, ### in sequence), prefer fenced code blocks (```), avoid HTML comments in MDX.

## Notes

- MDX 3 is enabled and compatible with Next 15 and Storybook 9.
- For long-form docs, prefer placing files under `/docs` and rendering them via the Project Docs Reader.
