SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c

# Adjustable parameters (override via: make VAR=value ...)
BRANCH ?= master
FORK_REMOTE ?= origin
UPSTREAM_REMOTE ?= upstream
UPSTREAM_URL ?= https://github.com/PranovAdilet/super-turbo.git

.PHONY: help remotes show-remotes ensure-clean fetch ensure-upstream ff rebase push sync sync-rebase prune status

help: ## Show this help
	@echo "Available targets:"
	@awk -F':.*##' '/^[a-zA-Z0-9_.-]+:.*##/ {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST) | sort
	@echo "\nVariables (override with VAR=value):"
	@echo "  BRANCH=$(BRANCH)  FORK_REMOTE=$(FORK_REMOTE)  UPSTREAM_REMOTE=$(UPSTREAM_REMOTE)"
	@echo "  UPSTREAM_URL=$(UPSTREAM_URL)"

remotes: ## Configure remotes (adds upstream if missing)
	@if ! git remote get-url $(UPSTREAM_REMOTE) >/dev/null 2>&1; then \
		echo "Adding remote '$(UPSTREAM_REMOTE)' -> $(UPSTREAM_URL)"; \
		git remote add $(UPSTREAM_REMOTE) $(UPSTREAM_URL); \
	else \
		echo "Remote '$(UPSTREAM_REMOTE)' exists: $$(git remote get-url $(UPSTREAM_REMOTE))"; \
	fi
	@echo "Fork remote in use: '$(FORK_REMOTE)' -> $$(git remote get-url $(FORK_REMOTE) 2>/dev/null || echo '<not set>')"

show-remotes: ## Print remotes
	@git remote -v | cat

ensure-clean: ## Abort if working tree is not clean
	@if ! git diff --quiet || ! git diff --cached --quiet; then \
		echo "Working tree is not clean. Commit or stash changes first."; \
		exit 1; \
	fi

fetch: ensure-clean remotes ## Fetch from upstream with prune
	@git fetch $(UPSTREAM_REMOTE) --prune | cat
	@# Ensure upstream branch exists
	@if ! git show-ref --verify --quiet refs/remotes/$(UPSTREAM_REMOTE)/$(BRANCH); then \
		echo "Branch '$(BRANCH)' not found on $(UPSTREAM_REMOTE)."; \
		exit 1; \
	fi

ff: fetch ## Try fast-forward merge of $(BRANCH) from upstream
	@git checkout $(BRANCH) | cat
	@# Attempt fast-forward only; if impossible, instruct to rebase
	@set -e; \
	if git merge --ff-only $(UPSTREAM_REMOTE)/$(BRANCH); then \
		echo "Fast-forward succeeded."; \
	else \
		echo "Fast-forward not possible. Run 'make sync-rebase' to rebase instead."; \
		exit 1; \
	fi

rebase: fetch ## Rebase local $(BRANCH) onto upstream/$(BRANCH)
	@git checkout $(BRANCH) | cat
	@git rebase $(UPSTREAM_REMOTE)/$(BRANCH) | cat

push: ## Push $(BRANCH) to fork (force-with-lease for rebased history)
	@git push --force-with-lease $(FORK_REMOTE) $(BRANCH) | cat

sync: ## Full sync using fast-forward: fetch -> ff -> push
	@$(MAKE) --no-print-directory ff
	@$(MAKE) --no-print-directory push

sync-rebase: ## Full sync using rebase: fetch -> rebase -> push
	@$(MAKE) --no-print-directory rebase
	@$(MAKE) --no-print-directory push

prune: ## Prune stale remote refs
	@git remote prune $(UPSTREAM_REMOTE) | cat || true
	@git remote prune $(FORK_REMOTE) | cat || true

status: ## Show concise repo status and recent graph
	@git status | cat
	@git log --oneline --graph --decorate --max-count=25 | cat
	@git remote -v | cat


