#!/usr/bin/env python3
"""Validate the repository's manual-only GitHub Pages workflow policy."""

from __future__ import annotations

import re
import sys
from pathlib import Path


EXPECTED_ACTIONS = {
    "actions/checkout": "3d3c42e5aac5ba805825da76410c181273ba90b1",
    "jdx/mise-action": "3c2e0cf82a5b2e5249f0d3635a4d83d0ae861518",
    "actions/configure-pages": "45bfe0192ca1faeb007ade9deae92b16b8254a0d",
    "actions/upload-pages-artifact": "fc324d3547104276b827a68afc52ff2a11cc49c9",
    "actions/deploy-pages": "cd2ce8fcbc39b97be8ca5fce6e763baed58fa128",
}


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: verify_pages_workflow.py <workflow-file>", file=sys.stderr)
        return 2

    workflow_file = Path(sys.argv[1])
    workflow = workflow_file.read_text(encoding="utf-8")

    trigger_match = re.search(r"(?ms)^on:\s*\n(?P<body>(?:^[ \t]+.*\n?)*)", workflow)
    if not trigger_match:
        raise SystemExit("Workflow is missing an on: trigger block")

    trigger_body = trigger_match.group("body")
    if not re.search(r"(?m)^\s+workflow_dispatch:\s*$", trigger_body):
        raise SystemExit("Workflow must include workflow_dispatch")

    disallowed = re.findall(
        r"(?m)^\s+(push|pull_request|schedule|release|repository_dispatch):",
        trigger_body,
    )
    if disallowed:
        raise SystemExit(
            "Deployment workflow must remain manual-only; found: "
            + ", ".join(sorted(set(disallowed)))
        )

    action_references = dict(
        re.findall(r"(?m)^\s*uses:\s+([^\s@]+)@([0-9a-f]{40})\s*(?:#.*)?$", workflow)
    )
    if action_references != EXPECTED_ACTIONS:
        raise SystemExit(
            "Pinned Action set differs from the reviewed policy:\n"
            f"expected={EXPECTED_ACTIONS}\nactual={action_references}"
        )

    if re.search(r"(?m)^\s*uses:\s+[^\s]+@v\d", workflow):
        raise SystemExit("Mutable major-version Action references are not allowed")

    required_fragments = (
        "VITE_BASE_PATH: /${{ github.event.repository.name }}/",
        "pnpm install --frozen-lockfile",
        "mise run check",
        "python3 scripts/verify_pages_build.py dist \"$VITE_BASE_PATH\"",
        "name: github-pages",
        "pages: write",
        "id-token: write",
    )
    missing = [fragment for fragment in required_fragments if fragment not in workflow]
    if missing:
        raise SystemExit("Workflow is missing required policy fragments: " + repr(missing))

    print(
        "Verified GitHub Pages workflow: manual-only trigger, "
        f"{len(action_references)} immutable Action pins"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
