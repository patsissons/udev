# μdev CLI

```
            _
           | |
  _   _  __| | _____   __
 | | | |/ _` |/ _ \ \ / /
 | |_| | (_| |  __/\ V /
 | ._,_|\__,_|\___| \_/
 | |
 |_|
```

μdev CLI tool to simplify development tasks

## Installation

See the [installation docs](https://patsissons.github.io/udev/#installation)

### Removal

`npm remove -g udev`

## Commands

This tool can perform the following commands

- [box](#box)
- [cd](#cd)
- [clone](#clone)
- [help](#help)
- [ping](#ping)
- [repo](#repo)
- [update](#update)
- [version](#version)

### box

`box` command to interact with `devbox`

#### box actions

ℹ️ _these actions are in development and may not work or change wihtout notice_

- `up` sets up the devbox environment
- `down` tears down the devbox environment
- `run` runs a custom devbox command
- `nuke` erases all devbox ephemeral data

### cd

`cd` command to change directory to `~/src/github.com/<org>/<repo>`

When changing directory to a _default_ org repository, you only need to provide the repo name.

#### cd options

- `--print`: prints the path instead of changing directory

### clone

`git clone` command to clone a repository to `~/src/github.com/<org>/<repo>`

When cloning a _default_ org repository, you only need to provide the repo name.

#### clone options

- `--http`: clones using the `https` url instead of `ssh` (e.g., `https://github.com/patsissons/udev.git`)
- `--replace`: first removes any existing cloned repository
- `--verbose`: emits commands being run

#### clone examples

- `dev clone udev`: performs a `git clone git@github.com:patsissons/udev.git ~/src/github.com/patsissons/udev`
- `dev clone blocklytics/ethereum-blocks --http` performs a `git clone https://github.com/blocklytics/ethereum-blocks ~/src/github.com/blocklytics/ethereum-blocks`

### help

Emits help about all commands or specific commands

You can also use `-h` or `--help` on any specific command to get help about that command

### help examples

- `dev help`: shows help about all commands
- `dev help clone`: shows help about the `clone` command
- `dev clone --help`: shows help about the `clone` command (same as `dev help clone`)

### ping

Simply emits `PONG`, this is a good smoke test to make sure the tool is not broken.

### repo

Runs repository actions, this is the default action if none is specified.

#### repo actions

- `up` sets up the repository
- `down` tears down the repository
- `run` runs a repository custom command
- `open` opens the configured repository url
- `nuke` erases all repository ephemeral data (⚠️ this will revert uncommitted changes ⚠️)

### update

Updates the tool to the latest version

### version

Emits the current version of the tool

## Development

### Getting started

- `pnpm dev` will run the tool from `src`
- `pnpm build` will build the tool in `dist`
- `pnpm start` runs a built tool

### Infrastructure

- All commands live in `src/commands` as their own file or directory
  - see `clone` for a good example to template from for a simple command.
  - see `repo` for a good example to template from for a sub-action based command.
- `chalk` provides a simple entry point to emitting content with styles from any command
- `runCommand`, `runCommands`, and `runConditionalCommands` simply executing commands

### Testing

- use `pnpm run-install` to install `dev` from local source
  - note that you need to commit any changes first as the installation will simulate a clone from your local repository
