FROM eclipse-temurin:17-jre-jammy

ARG CANTALOUPE_VERSION=5.0.6

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        unzip \
        libturbojpeg \
        libopenjp2-7 \
        ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/cantaloupe

RUN curl -fSL "https://github.com/cantaloupe-project/cantaloupe/releases/download/v${CANTALOUPE_VERSION}/cantaloupe-${CANTALOUPE_VERSION}.zip" \
        -o cantaloupe.zip && \
    unzip cantaloupe.zip && \
    mv cantaloupe-${CANTALOUPE_VERSION}/* . && \
    rmdir cantaloupe-${CANTALOUPE_VERSION} && \
    rm cantaloupe.zip

RUN mkdir -p /var/cantaloupe/images /var/cantaloupe/cache

COPY cantaloupe.properties /opt/cantaloupe/cantaloupe.properties

EXPOSE 8182

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8182/ || exit 1

ENTRYPOINT ["java", "-Dcantaloupe.config=/opt/cantaloupe/cantaloupe.properties", "-jar"]
CMD ["cantaloupe-5.0.6.jar"]
