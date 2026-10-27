# Chen diagram handoff views

Prepared 27 Oct 2026 from [the conceptual catalog](../DATA_MODEL.md#1-e-r-model-course-notation) and [the implemented schema](../../../db/schema.sql). These are editable technical source assets for the settled app, ready for later team review and slide selection. They are not a finished slide deck and do not claim to draw every entity, attribute or database constraint on one page.

## Open the diagrams

| View | Editable SVG | Local PNG preview | Main explanation |
|---|---|---|---|
| Forum and per-post identities | [forum-chen.svg](forum-chen.svg) | [forum-chen.png](forum-chen.png) | Author versus per-post participant; comments/replies; image identification; topics. |
| Private conversation contexts | [messaging-chen.svg](messaging-chen.svg) | [messaging-chen.png](messaging-chen.png) | Starter/recipient roles, optional post context, message ownership and sender membership. |
| Accounts, roles and event tickets | [accounts-events-chen.svg](accounts-events-chen.svg) | [accounts-events-chen.png](accounts-events-chen.png) | University domains, partial/disjoint ISA, organizers, tickets and deliberately stored derived inventory. |

The SVGs open locally in a browser and can be edited in a text or vector editor. Use the SVG when scaling/cropping for slides; use the PNG for convenient preview. Select one main view and the relationships that support the talk rather than shrinking all three into unreadable thumbnails. The full conceptual catalog and schema remain the reference for questions.

## Notation and mapping

- Rectangles are entity sets, ellipses attributes and diamonds relationship sets. Solid underlines mark entity keys. An arrow points to the entity on the at-most-one side. A double connecting line indicates total participation.
- `post_image` is a weak entity: double rectangle, double identifying diamond and dashed-underlined partial key `position`. Its relational key is `(post_id, position)`; `post_id` comes from its identifying post, not a separate conceptual identifier ellipse.
- `participates` is a many-to-many relationship with `alias_no` and `joined_at`, mapped to `post_participants`. The composite comment foreign key requires the author to participate in the same post. The schema additionally makes each alias unique within a post; the Content transaction allocates it under a post-row lock. These constraints are explained alongside the diagram rather than invented as extra entity sets.
- `replies to` is a recursive comment relationship with explicit `reply` and `original` roles. A reply has at most one original; participation is partial. The actual composite foreign key also keeps the original on the same post.
- The catalog's `between` relationship uses the same user entity set in two named roles. The diagram draws its two binary role projections as `starter` and `recipient`, so each conversation's total participation and exactly-one-user constraint are explicit without relying on ambiguous ternary arrows. Their IDs differ. These are the schema's existing two required user foreign keys, not new relationships or tables. Multiple conversations between the same users are distinguished by context; the generated pair/context uniqueness rule prevents duplicate conversations in one context. The diagram does not assert one conversation per user pair globally.
- A conversation optionally starts from a post. A message must belong to one conversation and have one sender. The sender-membership trigger is an additional cross-relationship constraint. Anonymity changes displayed aliases/public names through the query contract; the real user foreign keys still exist.
- `organization` and `admin` are a **partial, disjoint** specialization of `user`. A student is in neither subtype. Organization-specific fields map to `organizations`, with an inherited `user_id`; admin is represented by the user's role rather than a separate table.
- The event organizer relationship is drawn to `user`, qualified by the allowed organization/admin roles. This deliberately makes the diagram consistent with the actual `events.organizer_id → users.user_id` foreign key and the Events role guard. The catalog's shorthand “organization organizes event; admins may also organize” must not be read as forbidding admin organizers.
- `holds ticket` is a many-to-many relationship mapped to `tickets`, with key `(event_id, user_id)` and attributes `ticket_code`, `booked_at`, `checked_in_at`. It is not a separate rectangle merely because a table exists. Ticket codes are also unique in the schema.
- `domain` is a multivalued university attribute (double ellipse), mapped to `university_domains`. `tickets_left` is conceptually derived (dashed ellipse) but deliberately stored for the atomic booking transaction; see [the design justification](../DATA_MODEL.md#71-tickets_left-is-a-stored-derived-attribute).

These views select the core user flows. They omit reference/detail attributes and several catalog items, including email codes, notification/report/moderation details, like/watch/history relationships, read pointers, optional conversation blocks and infrastructure sessions/outbox. Their omission does not imply that these tables or features are absent. Consult the catalog/schema for the complete specification; do not present a partial view as a complete database schema.

## Rebuild and validation

`build_diagrams.py` uses Python's standard library to generate the three SVGs:

```bash
python3 docs/data/er/build_diagrams.py
```

The builder parses every result as SVG XML before writing it. The committed PNG previews were rendered from the SVGs with an available SVG renderer and visually inspected at their native dimensions. No external assets, fonts, network calls or application dependency were added. Python/the renderer are not prerequisites for running Campus Notes; the editable SVG and PNG files are already included.

For later edits, regenerate/export the matching PNG as well, inspect the new image, and check arrow directions, total-participation segments, role labels, key underlines, line crossings and text bounds. Human explanation/slide emphasis remains a team review task after the code/source baseline; this handoff does not replace that review.
