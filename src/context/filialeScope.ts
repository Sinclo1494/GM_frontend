import type { UserInfo } from "../types/user";

/**
 * The affiliate a user is locked to, or `null` when they may query every
 * affiliate database.
 *
 * A user assigned to a single affiliate (`profile.filiale`) can only read
 * that affiliate's database: the analysis endpoints answer 403 ("Accès
 * refusé à cette filiale.") for any other `code_filiale`, which the backend
 * enforces in `can_access_filiale`. A user holding
 * `administration.all_filiales` — or a superuser — is unrestricted and keeps
 * the free affiliate filter.
 */
export const lockedFiliale = (
  user:
    | Pick<UserInfo, "can_access_all_filiales" | "filiale">
    | null
    | undefined,
): string | null => {
  if (!user) return null;
  if (user.can_access_all_filiales) return null;
  const code = user.filiale?.trim();
  return code ? code : null;
};
