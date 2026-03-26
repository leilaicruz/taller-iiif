# Cantaloupe IIIF Image Server

Servidor de imágenes IIIF usando Cantaloupe 5.0.6.

## 🧩 Requisitos

Antes de empezar, necesitas:

* Docker instalado
* Docker Compose disponible (`docker compose`)

### Instalación recomendada (Ubuntu)

```bash
sudo apt update
sudo apt install docker.io
sudo systemctl enable docker
sudo systemctl start docker
```

### Permisos (IMPORTANTE)

Si ves errores como:

```
permission denied while trying to connect to the docker API
```

Ejecuta:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

O cierra sesión y vuelve a entrar.

---

## 🚀 Inicio rápido

```bash
# Crea un clon de este repositorio
git clone https://github.com/idourra/taller-iiif.git

# Crear la carpeta de imágenes
mkdir -p images

# Construir y levantar
docker compose up -d

# Ver logs
docker compose logs -f cantaloupe
```


## 🔍 Verificación

Comprueba que Docker funciona:

```bash
docker --version
docker compose version
```

Si `docker compose` falla, instala el plugin manualmente:

```bash
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```


## 🌐 Acceso

| Servicio           | URL                                                            |
| ------------------ | -------------------------------------------------------------- |
| IIIF Image API 2.1 | [http://localhost:8182/iiif/2/](http://localhost:8182/iiif/2/) |
| IIIF Image API 3.0 | [http://localhost:8182/iiif/3/](http://localhost:8182/iiif/3/) |
| Panel de admin     | [http://localhost:8182/admin](http://localhost:8182/admin)     |
| API de control     | [http://localhost:8182/api](http://localhost:8182/api)         |

**Credenciales por defecto:**
`admin` / `changeme` → ⚠️ cambiar en `cantaloupe.properties`


## 🖼️ Uso

1. Coloca imágenes en `images/`:

   * TIFF, JPEG, PNG, JP2, etc.

2. Accede vía IIIF:

```
http://localhost:8182/iiif/3/{nombre_archivo}/info.json
http://localhost:8182/iiif/3/{nombre_archivo}/full/max/0/default.jpg
```

### Ejemplo

```
http://localhost:8182/iiif/3/4.jpg/info.json
http://localhost:8182/iiif/3/4.jpg/full/600,/0/default.jpg
http://localhost:8182/iiif/3/4.jpg/square/256,256/0/default.jpg
```



## 🧱 Estructura

```
cantaloupe-iiif/
├── Dockerfile
├── docker-compose.yml
├── cantaloupe.properties
├── images/
└── README.md
```



## ⚙️ Configuración

Edita `cantaloupe.properties` y `docker-compose.yml`.

### Memoria (Java)

En `docker-compose.yml`:

```yaml
environment:
  JAVA_OPTS: -Xmx2g
```

Ejemplo:

```yaml
JAVA_OPTS: -Xmx4g
```



### Cache TTL

En `cantaloupe.properties`:

```properties
cache.server.derivative.ttl_seconds = 2592000
```

Ejemplos:

* 1 día → `86400`
* 7 días → `604800`



### Credenciales admin

```properties
endpoint.admin.username = admin
endpoint.admin.secret = changeme
```



### Puerto

En `docker-compose.yml`:

```yaml
ports:
  - "8182:8182"
```

Cambiar a:

```yaml
ports:
  - "8080:8182"
```



## 🔄 Aplicar cambios

Después de modificar configuración:

```bash
docker compose down
docker compose up -d
```

Si cambias la imagen o Dockerfile:

```bash
docker compose up -d --build
```



## 🧪 Workshop interactivo 

Este repositorio incluye un entorno de taller separado:

Archivo:

```
docker-compose.taller.yml
```

### Lanzar el workshop

```bash
docker compose -f docker-compose.taller.yml up -d --build
```

### Acceso

| Servicio    | URL                                                            |
| ----------- | -------------------------------------------------------------- |
| Workshop    | [http://localhost:9090](http://localhost:9090)                 |
| Editor IIIF | [http://localhost:9090/editor](http://localhost:9090/editor)   |
| IIIF proxy  | [http://localhost:9090/iiif/3/](http://localhost:9090/iiif/3/) |

📌 Este entorno incluye:

* nginx (frontend)
* Cantaloupe (backend)
* Proxy IIIF integrado


## 🧠 Conceptos clave

* Docker reemplaza entornos virtuales (no necesitas `venv`)
* El servidor es completamente containerizado
* IIIF requests siguen la especificación estándar



## 🛠️ Troubleshooting

### ❌ `docker: command not found`

Instalar Docker:

```bash
sudo apt install docker.io
```



### ❌ `permission denied docker.sock`

```bash
sudo usermod -aG docker $USER
newgrp docker
```



### ❌ `unknown shorthand flag: 'd' in -d`

→ Docker Compose no está instalado correctamente

Verifica:

```bash
docker compose version
```



### ❌ `docker compose` no existe

Instalar plugin manual:

```bash
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```


### ❌ Puerto ocupado

Si `8182` o `9090` están en uso:

```bash
sudo lsof -i :8182
```

Luego cambia el puerto en `docker-compose.yml`.


### ❌ Cambios no aplicados

Asegúrate de reiniciar:

```bash
docker compose down
docker compose up -d
```

## 🚀 Producción

Para despliegue en producción:

1. Usar HTTPS (nginx / traefik)
2. Cambiar credenciales por defecto
3. Ajustar memoria (`JAVA_OPTS`)
4. Configurar cache persistente
5. Limitar acceso al panel admin



