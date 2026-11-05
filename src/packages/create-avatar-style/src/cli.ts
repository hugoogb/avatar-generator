#!/usr/bin/env node
import { relative } from "node:path";
import { parseArgs } from "node:util";
import { scaffold, TEMPLATES, type TemplateName } from "./index";

const usage = `Usage: create-avatar-style <package-name> [options]

Options:
  -t, --template <name>   Starting point (default: minimal)
  -d, --directory <path>  Where to write it (default: the unscoped package name)
  -h, --help              Show this help

Templates:
${Object.entries(TEMPLATES)
    .map(([name, template]) => `  ${name.padEnd(10)}${template.description}`)
    .join("\n")}
`;

try {
    const { values, positionals } = parseArgs({
        allowPositionals: true,
        options: {
            template: { type: "string", short: "t" },
            directory: { type: "string", short: "d" },
            help: { type: "boolean", short: "h" },
        },
    });

    if (values.help) {
        console.log(usage);
    } else if (positionals.length !== 1) {
        console.error(usage);
        process.exitCode = 1;
    } else {
        const { directory } = scaffold({
            name: positionals[0],
            template: values.template as TemplateName | undefined,
            directory: values.directory,
        });
        const path = relative(process.cwd(), directory) || ".";
        console.log(`Created ${positionals[0]} in ${path}\n\n  cd ${path}\n  npm install\n  npm test\n`);
    }
} catch (error) {
    console.error(`create-avatar-style: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
}
