# Use a base image with Node.js version 20
FROM node:20-alpine3.16 as dev-deps

WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn install --frozen-lockfile

# Use a base image with Node.js version 20 for the builder stage
FROM node:20-alpine3.16 as builder

WORKDIR /app

COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

# Use a base image with Nginx
FROM nginx:1.23-alpine as prod

EXPOSE 80

COPY --from=builder /app/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx/nginx.conf /etc/nginx/conf.d

CMD [ "nginx", "-g", "daemon off;" ]
