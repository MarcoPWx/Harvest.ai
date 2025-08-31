const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Find all MDX story files
const mdxFiles = glob.sync("src/**/*.stories.mdx", {
  cwd: __dirname,
  absolute: true,
});

console.log(`Found ${mdxFiles.length} MDX files to fix`);

mdxFiles.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  let changed = false;

  // Fix imports from @storybook/blocks to @storybook/addon-docs
  if (content.includes("from '@storybook/blocks'")) {
    content = content.replace(/from\s+['"]@storybook\/blocks['"]/g, "from '@storybook/addon-docs'");
    changed = true;
  }

  // Fix React imports for MDX
  if (content.includes("import React") && !content.includes("import * as React")) {
    content = content.replace(
      /import React,?\s*{([^}]+)}\s+from\s+['"]react['"]/g,
      "import * as React from 'react';\nconst {$1} = React",
    );
    content = content.replace(/import React from ['"]react['"]/g, "import * as React from 'react'");
    changed = true;
  }

  // Fix Meta tag - ensure it doesn't use 'of' prop
  if (content.includes("<Meta") && content.includes(" of=")) {
    content = content.replace(
      /<Meta([^>]*)\s+of=\{([^}]+)\}([^>]*)\/>/g,
      "<Meta$1 component={$2}$3/>",
    );
    changed = true;
  }

  // Remove Title, Subtitle, Description, Primary components that don't exist in addon-docs
  const componentsToRemove = ["Title", "Subtitle", "Description", "Primary"];
  componentsToRemove.forEach((comp) => {
    const regex = new RegExp(`<${comp}>[^<]*<\\/${comp}>`, "g");
    if (content.match(regex)) {
      content = content.replace(regex, "");
      changed = true;
    }
    const selfClosingRegex = new RegExp(`<${comp}\\s*\\/>`, "g");
    if (content.match(selfClosingRegex)) {
      content = content.replace(selfClosingRegex, "");
      changed = true;
    }
  });

  // Remove these components from imports
  componentsToRemove.forEach((comp) => {
    content = content.replace(new RegExp(`,?\\s*${comp}`, "g"), "");
  });

  // Clean up import statements
  content = content.replace(/import\s+{\s*,/g, "import {");
  content = content.replace(/,\s*}/g, " }");
  content = content.replace(/{\s*}/g, "{}");

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Fixed: ${path.relative(__dirname, file)}`);
  } else {
    console.log(`No changes needed: ${path.relative(__dirname, file)}`);
  }
});

console.log("Done fixing MDX files!");
