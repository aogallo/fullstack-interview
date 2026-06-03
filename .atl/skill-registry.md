# Skill Registry — fullstack-interview

Generated: 2026-06-02
Mode: engram

## Project Conventions

No project-level convention files detected (AGENTS.md, CLAUDE.md, .cursorrules, etc.).
No project-level skills directory detected.

## User Skills

| Skill | Description | Trigger |
|-------|-------------|---------|
| branch-pr | PR creation workflow for Agent Teams Lite | When creating a pull request, opening a PR, or preparing changes for review |
| chained-pr | Split large changes into chained/stacked PRs | When a PR exceeds 400 changed lines, planning chained PRs |
| cognitive-doc-design | Design documentation reducing cognitive load | When writing guides, READMEs, RFCs, onboarding docs |
| comment-writer | Write warm, direct human comments | When drafting feedback, review comments, maintainer replies |
| context7-mcp | Fetch current library/framework docs | When user asks about libraries, frameworks, API references, code examples |
| find-skills | Discover and install agent skills | When user asks "how do I do X", "find a skill for X" |
| go-testing | Go testing patterns for Gentleman.Dots | When writing Go tests, using teatest |
| gsap | GSAP animation reference for HyperFrames | When writing GSAP animations in HyperFrames compositions |
| hyperframes | Create video compositions in HTML | When asked to build HTML-based video content |
| issue-creation | Issue creation workflow for Agent Teams Lite | When creating a GitHub issue, reporting a bug |
| judgment-day | Parallel adversarial review protocol | When user says "judgment day", "dual review", "doble review" |
| skill-creator | Create new AI agent skills | When user asks to create a skill or document patterns |
| website-to-hyperframes | Capture website → HyperFrames video | When user provides URL and wants a video |
| work-unit-commits | Structure commits as deliverable work units | When implementing changes, preparing commits, splitting PRs |

## Core SDD Skills (orchestrator-managed)

| Skill | Description |
|-------|-------------|
| sdd-init | Initialize SDD context in any project |
| sdd-explore | Investigate ideas before committing to a change |
| sdd-propose | Create a change proposal |
| sdd-spec | Write specifications with requirements |
| sdd-design | Create technical design documents |
| sdd-tasks | Break down changes into task checklists |
| sdd-apply | Implement tasks from the change |
| sdd-verify | Validate implementation against specs |
| sdd-archive | Archive completed changes |
| sdd-onboard | Guided end-to-end SDD walkthrough |

## Skill Locations

- `~/.config/opencode/skills/` — Primary user skills (gentleman-programming)
- `~/.claude/skills/` — Claude skills (mirror of above + context7-mcp)
- `~/.agents/skills/` — Additional user skills (hyperframes, gsap, find-skills, website-to-hyperframes)
