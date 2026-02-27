---
name: Database Skill
description: >
  Responsible for database schema design, table creation, migrations, and
  data integrity for a multi-user web application using SQLModel and
  Neon Serverless PostgreSQL.
version: 1.0.0
---

# Database Skill

## Purpose
The Database Skill encapsulates all responsibilities related to persistent
storage. It ensures that data models are well-structured, normalized,
migratable, and correctly aligned with application requirements.

This skill is critical for maintaining data integrity, scalability, and
clear ownership boundaries between users.

---

## When to Use This Skill

Use the **Database Skill** when:
- Designing database schemas and relationships
- Creating tables for users, todos, and related entities
- Defining primary keys, foreign keys, and indexes
- Planning and applying database migrations
- Ensuring per-user data isolation at the schema level
- Integrating SQLModel with PostgreSQL

Do **NOT** use this skill for:
- Authentication logic (handled by Auth Skill)
- API route implementation
- Frontend data presentation

---

## Process Steps (Schema & Migration Flow)

1. **Requirements Analysis**
   - Identify entities (e.g., User, Todo)
   - Determine relationships and ownership boundaries
   - Define required fields and constraints

2. **Schema Design**
   - Design normalized tables
   - Assign primary keys (UUID or integer IDs)
   - Define foreign key relationships
   - Add indexes for common query patterns

3. **Multi-User Data Isolation**
   - Ensure every user-owned record includes a `user_id`
   - Enforce referential integrity with foreign keys
   - Design schema to support filtering by authenticated user

4. **SQLModel Mapping**
   - Define SQLModel classes for each table
   - Ensure compatibility with FastAPI ORM usage
   - Align field types with PostgreSQL best practices

5. **Migration Planning**
   - Generate migrations for schema changes
   - Ensure migrations are reversible
   - Avoid destructive changes without explicit approval

6. **Validation**
   - Verify schema matches application specs
   - Confirm migrations apply cleanly on Neon PostgreSQL
   - Ensure schema supports expected query patterns

---

## Output Format

When this skill is applied, the output should include:

- Table definitions (logical schema)
- SQLModel model specifications
- Primary and foreign key relationships
- Migration steps (create / alter / rollback)
- Notes on indexing and performance considerations

Outputs must be:
- Deterministic
- Migration-safe
- Compatible with Neon Serverless PostgreSQL
- Designed for multi-user isolation

---
