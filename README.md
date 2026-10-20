# Clutta for Homebrew

Install Clutta on macOS, for Apple Silicon or Intel:

```sh
brew install sefastech/tap/clutta
clutta --help
```

Then follow the [getting started guide](https://docs.clutta.io/get-started).

## Upgrade

```sh
brew update
brew upgrade sefastech/tap/clutta
```

The formula downloads the official stable binary from
[Clutta releases](https://github.com/sefastech/clutta-cli-releases/releases)
and verifies its pinned SHA-256 checksum. It does not build or publish Clutta's
source code, configure an account, or start a collector.

Linux installation is unchanged. Use the installer documented at
[docs.clutta.io](https://docs.clutta.io/get-started).

## Troubleshooting

- **Repository not found:** this public tap needs no GitHub account or token.
  Retry `brew install sefastech/tap/clutta`. If cloning still fails, check your
  GitHub access and local Git configuration.
- **Another Clutta installation already exists:** run `which -a clutta` and
  decide which installation to keep. Do not force-overwrite an existing binary.
- **Checksum mismatch:** stop and report it. Do not bypass checksum verification.

## Maintaining this tap

The update workflow checks the latest public stable release daily or on manual
dispatch. It verifies both macOS downloads against the published checksum list,
then opens a version-specific PR. Review and merge the PR after both macOS
installation tests pass. It never promotes a prerelease or silently rewrites
the existing formula for a same-version asset change.

Manual update and validation:

```sh
node scripts/update.mjs
node --test scripts/update.test.mjs
brew install --build-from-source sefastech/tap/clutta
brew test sefastech/tap/clutta
```

GitHub Actions must be allowed to create pull requests for scheduled updates.
No cross-repository release token is required. All release inputs are public.
