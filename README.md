# Cantaloupe IIIF Image Server

Servidor de imágenes IIIF usando [Cantaloupe 5.0.6](https://cantaloupe-project.github.io/manual/5.0/).

## Inicio rápido

```bash
# Crear la carpeta de imágenes
mkdir -p images

# Construir y levantar
docker compose up -d

# Ver logs
docker compose logs -f cantaloupe
```

## Acceso

| Servicio | URL |
|---|---|
| IIIF Image API 2.1 | http://localhost:8182/iiif/2/ |
| IIIF Image API 3.0 | http://localhost:8182/iiif/3/ |
| Panel de admin | http://localhost:8182/admin |
| API de control | http://localhost:8182/api |

**Credenciales por defecto:** `admin` / `changeme` (cambiar en `cantaloupe.properties`)

## Uso

1. Coloca imágenes (TIFF, JPEG, PNG, JP2, etc.) en la carpeta `images/`.
2. Accede vía IIIF:

```
http://localhost:8182/iiif/3/{nombre_archivo}/info.json
http://localhost:8182/iiif/3/{nombre_archivo}/full/max/0/default.jpg
```

Ejemplo con un archivo `foto.tif`:

```
http://localhost:8182/iiif/3/foto.tif/info.json
http://localhost:8182/iiif/3/foto.tif/full/600,/0/default.jpg
http://localhost:8182/iiif/3/foto.tif/square/256,256/0/default.jpg
```

## Estructura

```
cantaloupe-iiif/
├── Dockerfile
├── docker-compose.yml
├── cantaloupe.properties    # Configuración del servidor
├── images/                  # Montar imágenes aquí
└── README.md
```

## Configuración

Edita `cantaloupe.properties` para ajustar:

- **Memoria:** Cambia `JAVA_OPTS` en `docker-compose.yml` (default: `-Xmx2g`)
- **Cache TTL:** `cache.server.derivative.ttl_seconds` (default: 30 días)
- **Credenciales admin:** `endpoint.admin.username` / `endpoint.admin.secret`
- **Puerto:** Cambia el mapeo en `docker-compose.yml`

## Producción

Para producción, cambia las credenciales y considera:

1. Usar un reverse proxy (nginx/traefik) con HTTPS delante.
2. Ajustar los límites de memoria según el volumen de imágenes.
3. Habilitar cache de derivados para mejor rendimiento.
