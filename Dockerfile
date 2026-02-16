# Stage 1: Install PHP dependencies
FROM composer:2 AS composer-deps

WORKDIR /build
COPY apps/api/composer.json apps/api/composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --no-autoloader \
    --prefer-dist

COPY apps/api/ ./
RUN mkdir -p bootstrap/cache && composer dump-autoload --optimize --no-dev

# Stage 2: Install Node.js dependencies for chain.mjs
FROM node:20-alpine AS node-deps

WORKDIR /chain
RUN echo '{"private":true,"type":"module","dependencies":{"ethers":"^6.16.0"}}' > package.json
RUN npm install --production

COPY contracts/scripts/chain.mjs /chain/scripts/chain.mjs

# Stage 3: Production runtime
FROM php:8.4-fpm-alpine AS runtime

RUN apk add --no-cache \
    nginx \
    supervisor \
    nodejs \
    postgresql-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    curl

RUN docker-php-ext-install \
    pdo_pgsql \
    pgsql \
    mbstring \
    bcmath \
    opcache \
    zip \
    intl \
    pcntl

RUN { \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.interned_strings_buffer=8'; \
    echo 'opcache.max_accelerated_files=4000'; \
    echo 'opcache.revalidate_freq=0'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.enable_cli=1'; \
    } > /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/html

COPY --from=composer-deps /build /var/www/html
COPY --from=node-deps /chain /chain

RUN mkdir -p \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

RUN chown -R www-data:www-data storage bootstrap/cache

COPY deploy/nginx.conf /etc/nginx/http.d/default.conf
COPY deploy/supervisord.conf /etc/supervisord.conf
COPY deploy/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 10000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
