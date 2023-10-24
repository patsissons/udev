FROM node:18

RUN npm install -g pnpm
RUN mkdir -p /usr/local/src/udev
COPY . /usr/local/src/udev
WORKDIR /usr/local/src/udev
RUN pnpm run-install
WORKDIR /
ENTRYPOINT ["dev"]
