---
id: constitution-20260217-002
title: Todo Hackathon Constitution v1.0.1 (Data Type Fixes)
stage: constitution
date: 2026-02-17
tags: [constitution, hackathon, todo-app, spec-driven, data-types]
---

# Todo Hackathon Constitution v1.0.1 (Data Type Fixes)

## Prompt

```
Update constitution.md to eliminate all vagueness and make it 100% actionable.
Vagueness:
User ID Data Type Inconsistency
Location: Database Schema Standards
Vague Statement: Shows users.id: string but tasks.id: integer
Problem: Mixing data types for primary keys
Missing: Explicit rule: all PKs must be integers
Table Naming Inconsistency
Location: Database Schema Standards
Vague Statement: "Table names: Lowercase, plural (users, tasks, refreshtoken)"
Problem: Says "plural" but shows "refreshtoken" (singular)
Missing: Consistent rule, should be "refreshtokens"
```

## Response

Updated the constitution file to eliminate vagueness and make it 100% actionable. Key changes made:

1. Fixed Database Schema Standards to clarify that ALL primary keys must be integers, including explicit statement about user_id consistency across tables (users.id: integer, tasks.user_id: integer, refreshtokens.user_id: integer)

2. Corrected table naming to use "refreshtokens" (plural) to be consistent with the "plural" requirement

3. Updated API Conventions to specify that user_id in URLs are integers

4. Enhanced Security Requirements to be more specific about user data isolation via integer user_id matching

5. Updated Phase II Completion Checklist to specify integer user_id and primary keys

6. Enhanced Security Criteria to include verification of integer user_id matching

7. Updated Final Reminders to emphasize consistent integer data types

Version updated from 1.0.0 to 1.0.1 to reflect these important clarifications.