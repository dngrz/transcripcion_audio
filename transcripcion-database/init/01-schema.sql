-- =====================================================================
-- Esquema de base de datos: transcripcion_gestion
-- Motor: PostgreSQL 16
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tabla: users
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL       PRIMARY KEY,
    email           VARCHAR(180)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    full_name       VARCHAR(180)    NOT NULL,
    role            VARCHAR(20)     NOT NULL DEFAULT 'USER',
    enabled         BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT ck_users_role CHECK (role IN ('ADMIN', 'USER'))
);

-- ---------------------------------------------------------------------
-- Tabla: transcriptions
-- Solo se persiste metadata y el texto; el audio NUNCA se almacena.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transcriptions (
    id                  BIGSERIAL               PRIMARY KEY,
    user_id             BIGINT                  NOT NULL,
    original_filename   VARCHAR(255)            NOT NULL,
    format              VARCHAR(10)             NOT NULL,
    size_bytes          BIGINT                  NOT NULL,
    language            VARCHAR(10)             NOT NULL DEFAULT 'es',
    transcribed_text    TEXT                    NOT NULL,
    status              VARCHAR(30)             NOT NULL DEFAULT 'PENDIENTE_REVISION',
    created_at          TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transcriptions_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_transcriptions_status
        CHECK (status IN ('PENDIENTE_REVISION', 'REVISADA'))
);

CREATE INDEX IF NOT EXISTS idx_transcriptions_user_id    ON transcriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_transcriptions_created_at ON transcriptions (created_at DESC);

-- ---------------------------------------------------------------------
-- Tabla: transcription_revisions
-- Historial de correcciones manuales del texto transcrito.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transcription_revisions (
    id                      BIGSERIAL   PRIMARY KEY,
    transcription_id        BIGINT      NOT NULL,
    previous_text           TEXT        NOT NULL,
    new_text                TEXT        NOT NULL,
    edited_by_user_id       BIGINT      NOT NULL,
    edited_at               TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_revisions_transcription
        FOREIGN KEY (transcription_id) REFERENCES transcriptions (id) ON DELETE CASCADE,
    CONSTRAINT fk_revisions_user
        FOREIGN KEY (edited_by_user_id) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_revisions_transcription_id
    ON transcription_revisions (transcription_id, edited_at DESC);
