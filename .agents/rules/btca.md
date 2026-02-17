# Tools Rules

## btca

### What is btca?

btca is a command-line tool that provides context-aware answers by searching source code and documentation straight from github or local repositories.

### One-shot Question

```bash
btca ask --resource <name> --question "<question>"
```

```bash
btca ask -r svelte -q "How do I create a reactive store?"
```

Multiple resources:

```bash
btca ask -r react -r typescript -q "How do I type useState?"
```

### List Resources

```bash
btca config resources list
```

### Add Resource

# Git repository

```bash
btca config resources add --name effect --type git --url https://github.com/Effect-TS/effect --branch main
```

# Local directory

```bash
btca config resources add --name myproject --type local --path /path/to/project
```

### Clear Cache

```bash
btca clear
```

## Available Resources

Common resources include: btca, agentskills, shadcn, svelte, resend

## Usage Tips

- Ask specific questions for better results
- Use multiple resources when comparing technologies
