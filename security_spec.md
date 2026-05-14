# Security Specification: Shohoj World

## 1. Data Invariants
- A user can only read their own profile.
- A user can only complete a task if they exist and haven't hit daily limits (limits checked via client and enforced via rules if possible, but definitely rewards are tied to uid).
- A withdrawal can only be created by the user who owns the balance.
- Only admins can update withdrawal status, task definitions, and global settings.
- `balance` and `totalEarned` can only be incremented by task completion logic (enforced by `existsAfter` or similar atomicity if we use batches, but for simplicity here we focus on preventing unauthorized writes).
- Referral codes must be unique (hard to enforce strictly in rules without a dedicated collection, but we'll assume uniqueness for now).

## 2. The Dirty Dozen Payloads (Red Team Attacks)

1. **Identity Spoofing (Create User)**: Attempt to create a user document for someone else's UID.
2. **Balance Injection**: A user tries to update their own `balance` field directly without completing a task.
3. **Admin Promotion**: A user tries to create an `admins` document for themselves.
4. **Task reward manipulation**: A user tries to create a `userTasks` entry with a higher reward than the task specifies.
5. **Withdrawal Approval**: A user tries to update their own withdrawal status from `pending` to `approved`.
6. **Task Creation**: A non-admin tries to create a new `Task`.
7. **Negative Withdrawal**: A user tries to request a withdrawal with a negative amount.
8. **Settings Tampering**: A user tries to change `minWithdrawal` in the `settings` collection.
9. **Referral Count inflation**: A user tries to increment their `referralsCount` directly.
10. **Shadow Field Injection**: Adding an `isAdmin: true` field to a user profile document.
11. **Update Immutable Fields**: Trying to change `createdAt` on a user document.
12. **PII Leak**: A user trying to list all users to see emails.

## 3. Test Runner (Mock Tests Logic)
(These would be implemented in `firestore.rules.test.ts` if we were running a local emulator environment, but here we will focus on the rules logic).
