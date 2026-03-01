# Branch Protection Rules

This document describes the branch protection rules that should be configured on GitHub.

## Protected Branches

### 1. `main` (Production)
- ✅ Require pull request before merging
- ✅ Require approvals: 1 (from @krishnakanth072)
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require status checks to pass before merging:
  - CI/CD Pipeline
  - Lint Code
  - TypeScript Type Check
  - Build Check
  - Security Scan
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Require signed commits (optional)
- ✅ Include administrators (even admins must follow rules)
- ✅ Restrict who can push to matching branches
  - Only @krishnakanth072 can push directly
- ✅ Allow force pushes: NO
- ✅ Allow deletions: NO

### 2. `staging` (Pre-Production)
- ✅ Require pull request before merging
- ✅ Require approvals: 1 (from @krishnakanth072)
- ✅ Require status checks to pass before merging:
  - CI/CD Pipeline
  - Lint Code
  - Build Check
- ✅ Require branches to be up to date before merging
- ✅ Restrict who can push to matching branches
  - Only @krishnakanth072 can push directly
- ✅ Allow force pushes: NO
- ✅ Allow deletions: NO

### 3. `dev` (Development)
- ✅ Require pull request before merging
- ✅ Require approvals: 1 (from @krishnakanth072)
- ✅ Require status checks to pass before merging:
  - CI/CD Pipeline
  - Lint Code
- ✅ Restrict who can push to matching branches
  - Only @krishnakanth072 can push directly
- ✅ Allow force pushes: NO
- ✅ Allow deletions: NO

## Branch Workflow

```
feature/xyz → dev → staging → main
    ↓          ↓       ↓        ↓
  Local    Development Testing Production
```

### Development Flow:
1. Create feature branch from `dev`
2. Make changes and commit
3. Create PR to `dev`
4. After approval, merge to `dev`
5. Test in development environment

### Staging Flow:
1. Create PR from `dev` to `staging`
2. After approval, merge to `staging`
3. Auto-deploy to staging environment
4. QA testing

### Production Flow:
1. Create PR from `staging` to `main`
2. After approval and all checks pass, merge to `main`
3. Auto-deploy to production
4. Monitor for issues

## How to Configure on GitHub

### Step 1: Go to Repository Settings
1. Open: https://github.com/KrishnaKanth072/edge-esg-frontend
2. Click "Settings" tab
3. Click "Branches" in left sidebar

### Step 2: Add Branch Protection Rule for `main`
1. Click "Add branch protection rule"
2. Branch name pattern: `main`
3. Enable all checkboxes as listed above
4. Add required status checks
5. Add @krishnakanth072 as allowed to push
6. Click "Create"

### Step 3: Add Branch Protection Rule for `staging`
1. Click "Add branch protection rule"
2. Branch name pattern: `staging`
3. Enable checkboxes as listed above
4. Click "Create"

### Step 4: Add Branch Protection Rule for `dev`
1. Click "Add branch protection rule"
2. Branch name pattern: `dev`
3. Enable checkboxes as listed above
4. Click "Create"

## Enforcement

With these rules:
- ❌ Cannot delete `main`, `staging`, or `dev` branches
- ❌ Cannot force push to protected branches
- ❌ Cannot merge without approval from @krishnakanth072
- ❌ Cannot merge if status checks fail
- ✅ All changes must go through pull requests
- ✅ Code review is mandatory
- ✅ Quality gates are enforced

## Benefits

✅ **Prevents Accidents** - Can't accidentally delete important branches
✅ **Code Quality** - All changes reviewed before merge
✅ **Automated Testing** - CI/CD runs on every PR
✅ **Audit Trail** - All changes tracked in PRs
✅ **Team Collaboration** - Clear workflow for multiple developers
✅ **Production Safety** - Multiple checks before production deployment

## Matching Backend Structure

This matches your backend repository structure:
- Backend: `main`, `dev`, `Teach` (protected)
- Frontend: `main`, `staging`, `dev` (protected)

Both have the same level of protection and workflow! ✅
