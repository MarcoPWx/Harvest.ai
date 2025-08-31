import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";

export const mdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [],
  providerImportSource: "@mdx-js/react",
};

export default mdxOptions;
