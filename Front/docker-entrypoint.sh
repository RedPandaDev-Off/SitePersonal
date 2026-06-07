#!/bin/sh
set -e

CERT_PATH="/etc/letsencrypt/live/redpandev.fr/fullchain.pem"
SSL_CONF="/etc/nginx/ssl.conf"
HTTP_CONF="/etc/nginx/http.conf"
ACTIVE_CONF="/etc/nginx/conf.d/default.conf"

if [ -f "$CERT_PATH" ]; then
    echo "[nginx] Certificat SSL trouvé → config HTTPS activée"
    cp "$SSL_CONF" "$ACTIVE_CONF"
else
    echo "[nginx] Pas de certificat SSL → config HTTP uniquement"
    echo "[nginx] Lancez certbot puis redémarrez le conteneur pour activer HTTPS"
    cp "$HTTP_CONF" "$ACTIVE_CONF"
fi

exec nginx -g "daemon off;"
