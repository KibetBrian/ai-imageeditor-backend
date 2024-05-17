# Stage 1: Build container
FROM node:22 AS builder

WORKDIR /app

COPY package*.json /app/

COPY . .

RUN yarn install

RUN yarn build

# Stage 2: Production container
FROM node:22-alpine3.18

RUN apk update --no-cache && \
    apk upgrade --no-cache

WORKDIR /app

RUN addgroup --system --gid 1001 nonroot && adduser --system --uid 1001 --ingroup nonroot nonroot

COPY --from=builder /app/package.json /app/

COPY --from=builder /app/yarn.lock /app/

COPY --from=builder /app/build/ /app/

COPY --from=builder /app/prisma/ /app/prisma

COPY ./prisma/schema.prisma /app/prisma

COPY --from=builder /app/start.sh /app/

RUN yarn install

RUN mkdir -p /app/logs

RUN chown -R nonroot:nonroot /app

RUN chmod +x /app/start.sh

USER nonroot

EXPOSE 8080

ENTRYPOINT ["./start.sh"]
