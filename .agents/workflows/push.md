---
description: Automatically add, commit, and push changes to the repository
---

// turbo-all
1. Run `git add .` to stage all current changes.
2. Run `git commit -m "Auto-commit from workflow: $(date +'%Y-%m-%d %H:%M:%S')"` to commit the staged changes.
3. Run `git push` to push the commits to the remote repository.
