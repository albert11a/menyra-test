#!/usr/bin/env bash
# VERCEL "IGNORED BUILD STEP" - spart Builds, die nichts an der Seite aendern.
#
# Vercel ruft das vor jedem Build auf:  exit 0 = Build ueberspringen,
#                                        exit 1 = bauen.
# Uebersprungen wird NUR, wenn seit dem letzten Deploy ausschliesslich
# Dateien geaendert wurden, die Vercel nie ausliefert: Tests, GitHub-
# Workflows, Seed-Daten, Firebase Functions (die deployt Firebase, nicht
# Vercel) und die Codex-Berichte. Im Zweifel wird IMMER gebaut: fehlt der
# vorige Stand, klappt git nicht oder ist irgendeine andere Datei dabei.
set -u

VORHER="${VERCEL_GIT_PREVIOUS_SHA:-}"
if [ -z "$VORHER" ]; then echo "Kein vorheriger Deploy bekannt - bauen."; exit 1; fi
if ! git cat-file -e "$VORHER^{commit}" 2>/dev/null; then
  git fetch --quiet --depth=50 origin "$VORHER" 2>/dev/null || true
fi
if ! GEAENDERT="$(git diff --name-only "$VORHER" HEAD 2>/dev/null)"; then
  echo "Vergleich mit $VORHER nicht moeglich - bauen."; exit 1
fi
if [ -z "$GEAENDERT" ]; then echo "Nichts geaendert - bauen (sicher ist sicher)."; exit 1; fi

SEITE="$(printf '%s\n' "$GEAENDERT" | grep -Ev '^(tests/|\.github/|seed/|functions/|docs/codex/)' || true)"
if [ -z "$SEITE" ]; then
  echo "Nur Tests/Workflows/Seed/Functions/Berichte geaendert - Build uebersprungen."
  exit 0
fi
echo "Seitendateien geaendert - bauen:"; printf '%s\n' "$SEITE" | head -20
exit 1
