---
name: git-commit-by-scope
description: "Analyze the current git changes, split them into related commits, and write commit messages with this convention: feat, fix, docs, style, design, test, refactor, build, ci, perf, chore, rename, remove. Use when Codex should review modified files, group related changes instead of one big commit, choose the best commit type, stage only the relevant hunks or paths, and create multiple focused commits."
---

# Git Commit by Scope

Follow this workflow whenever the skill is invoked.

## Goal

Create small, intention-revealing commits from the current working tree.

Do not create one catch-all commit unless the diff is truly one indivisible change.

## Inspect First

1. Check the repository state with `git status --short`.
2. Review the diff with file-level and hunk-level attention.
3. Infer the user's intent from the actual edits, not only filenames.
4. Separate unrelated work before staging anything.

## Split Rules

Group changes by one shared purpose.

Good grouping signals:

- One user-facing feature
- One bug fix
- One refactor that supports no behavior change
- One docs-only update
- One rename-only change
- One remove-only change

Do not combine these into one commit:

- Feature work with refactors
- Bug fixes with formatting-only edits
- Production refactors with test-only updates, unless the test change only verifies that refactor's behavior
- UI styling changes with unrelated backend logic
- Renames/removals with additional content edits, unless the rename or removal is inseparable from the change

When a file contains multiple unrelated edits, prefer partial staging such as `git add -p`.

When the split is ambiguous, stop and ask the user for confirmation before committing.

## Commit Type Selection

Choose exactly one type per commit:

- `feat`: new functionality
- `fix`: bug fix
- `docs`: documentation only
- `style`: formatting or style-only code changes with no behavior impact
- `design`: UI or CSS design changes
- `test`: test code changes, or test-focused maintenance
- `refactor`: production code restructuring with no intended behavior change
- `build`: build files or packaging changes
- `ci`: CI workflow/config changes
- `perf`: performance improvement
- `chore`: small maintenance work that fits none of the above
- `rename`: file or folder rename only
- `remove`: file deletion only

Prefer the most specific valid type.

Use `design` instead of `style` for visible UI/CSS design changes.

Use `rename` or `remove` only when the commit is purely that operation. If a renamed file is also meaningfully edited, choose the type that matches the real purpose of the change.

## Message Format

Write commit messages in this format:

```text
[type]: 한글 요약
```

Rules for the summary:

- Keep it short and concrete
- Describe the intent, not the diff mechanics
- Write the summary in Korean
- Use a concise noun phrase or short action-oriented wording consistently
- Avoid trailing punctuation
- Avoid vague summaries like `update stuff` or `misc fixes`

Good examples:

- `[feat]: 플레이리스트 공개 범위 필터 추가`
- `[fix]: 중복 슬러그 생성 방지`
- `[docs]: Prisma 로컬 실행 방법 문서화`
- `[design]: 관리자 클립 폼 간격 조정`
- `[refactor]: 인증 토큰 파싱 로직 분리`
- `[rename]: clip dto 디렉터리 이름 변경`

## Staging and Committing

For each commit group:

1. Stage only the files or hunks that belong to that group.
2. Re-check staged content before committing.
3. Create the commit.
4. Re-run `git status --short`.
5. Continue with the remaining unstaged changes.

Before each commit, verify that the staged diff matches exactly one intent.

If the user asked for commit help but did not explicitly ask to execute commits, prepare the grouping plan and suggested messages first.

If the user asked to finish the job, proceed through staging and committing group by group.

## Safety Rules

- Never stage everything by default with `git add .` or `git commit -am` when multiple intents exist.
- Never rewrite or squash existing commits unless the user explicitly asks.
- Never include unrelated dirty files just to make the tree clean.
- Call out risky or mixed diffs before committing.
- Respect existing user changes and do not revert them unless asked.

## Output Format

When reporting back to the user, provide:

1. The commit groups you identified
2. The commit message used or proposed for each group
3. Any leftovers that should stay uncommitted or need user confirmation
