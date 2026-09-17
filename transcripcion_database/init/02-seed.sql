-- =====================================================================
-- Datos iniciales
-- =====================================================================

-- Usuario administrador por defecto.
-- Credenciales: admin@transcripcion.local / Admin123*
-- (hash BCrypt). Cambiar la contraseña en entornos no locales.
INSERT INTO users (email, password_hash, full_name, role, enabled)
VALUES (
    'admin@transcripcion.local',
    '$2b$10$GLIa8s.xKJ6z25/K8OnFPesakuj7V2jVwVI9eRnnztcHRykuc3nJy',
    'Administrador',
    'ADMIN',
    TRUE
)
ON CONFLICT (email) DO NOTHING;
