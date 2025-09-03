If secrets were committed to git history — plan to remove them and rotate keys.

Recommended: use git-filter-repo (fast and reliable)

1. Install git-filter-repo
- macOS (homebrew): brew install git-filter-repo
- or pip: pip install git-filter-repo

2. Backup current repo (always):
- git bundle create repo.bundle --all

3. Remove secrets by path or pattern
- Example: remove .env.local from history:
  git filter-repo --path .env.local --invert-paths

- Example: replace a secret token string across history:
  git filter-repo --replace-text <(echo 'OLD_SECRET==>REDACTED')

4. Force-push cleaned history to origin (coordinate with team):
- git push --force --all
- git push --force --tags

5. Ask collaborators to re-clone the repo after the rewrite.

Notes:
- This is destructive. Only proceed after rotating existing keys and communicating with your team.
- Alternatively use BFG Repo-Cleaner if you prefer.
