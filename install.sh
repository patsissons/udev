#!/bin/bash

# set -x

INSTALL_HOME=${INSTALL_HOME:-/usr/local/lib}
INSTALL_PATH=${INSTALL_PATH:-${INSTALL_HOME}/udev}
INSTALL_REPO=${INSTALL_REPO:-https://github.com/patsissons/udev.git}
INSTALL_REMOTE=${INSTALL_REMOTE:-origin}
INSTALL_BRANCH=${INSTALL_BRANCH:-main}
INSTALL_MODE=upgrade

if [ ! -d "${INSTALL_PATH}" ]; then
  mkdir -p ${INSTALL_PATH} || \
  $(echo "\n\033[0;31mUnable to create μdev install path: ${INSTALL_PATH}" && exit 1)
fi

if [ ! -d "${INSTALL_PATH}/.git" ]; then
  rm -rf "${INSTALL_PATH}/{*,.*}" || \
  $(echo "\n\033[0;31mUnable to clean invalid μdev install path: ${INSTALL_PATH}" && exit 1)

  INSTALL_MODE=install
fi

if [ -d "${INSTALL_PATH}/.git" ]; then
  pushd "${INSTALL_PATH}" && \
  $(git remote set-url "${INSTALL_REMOTE}" "${INSTALL_REPO}" || git remote add "${INSTALL_REMOTE}" "${INSTALL_REPO}") && \
  git fetch "${INSTALL_REMOTE}" "${INSTALL_BRANCH}" && \
  git checkout "${INSTALL_BRANCH}" && \
  git reset --hard "${INSTALL_REMOTE}/${INSTALL_BRANCH}" &&
  popd || \
  $(echo "\n\033[0;31mUnable to update μdev repository" && popd && exit 1)
else
  git clone --depth 1 --origin "${INSTALL_REMOTE}" --branch "${INSTALL_BRANCH}" "${INSTALL_REPO}" "${INSTALL_PATH}" || \
  $(echo "\n\033[0;31mUnable to clone μdev repository" && exit 1)
fi

if [ "${INSTALL_REMOTE}" == "origin" ]; then
  rm -rf "${INSTALL_PATH}/COMMIT"
else
  pushd "${INSTALL_PATH}" && \
  git rev-parse --short HEAD > COMMIT && \
  popd || \
  $(echo "\n\033[0;31mUnable to write μdev commit hash" && popd && exit 1)
fi

pushd "${INSTALL_PATH}" && \
pnpm install && \
pnpm build && \
npm install --global --force "${INSTALL_PATH}" && \
popd && \
echo "\n\033[0;32mμdev ${INSTALL_MODE} successful: $(dev --quiet version)" || \
$(echo "\n\033[0;31mUnable to ${INSTALL_MODE} μdev" && popd && exit 1)
