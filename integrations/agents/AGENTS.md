# Universal Agent Instructions: MiniSpeckit

This project adheres to **Spec-Driven Development (SDD)** powered by **MiniSpeckit**.

## Workflow Protocol
1. **Planning**: Every non-trivial feature or architectural change begins with a spec in `specs/NNN-slug.md`.
   - Scaffold new specs using: `npx minispeckit new "<feature-name>"`
2. **Review Gate**: Do not begin writing implementation code until the user approves the spec blueprint.
3. **Execution**:
   - Follow the tasks defined in Section 3 of the spec.
   - Update task checkboxes from `- [ ]` to `- [x]` as you complete them.
   - Run tests to verify each step.
4. **Completion**:
   - Run `npx minispeckit status` to ensure all tasks are marked complete.
   - Execute verification commands in Section 4.
