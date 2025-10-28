CREATE TABLE IF NOT EXISTS user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    notification_email BOOLEAN DEFAULT true,
    notification_push BOOLEAN DEFAULT false,
    dark_theme BOOLEAN DEFAULT false,
    alert_days_before INTEGER DEFAULT 3,
    CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Inserir configurações padrão para usuários existentes
INSERT INTO user_settings (user_id, notification_email, notification_push, dark_theme, alert_days_before)
SELECT id, true, false, false, 3
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_settings us WHERE us.user_id = u.id
);