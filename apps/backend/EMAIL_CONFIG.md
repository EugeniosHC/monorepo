# Configuração do Sistema de Notificações por Email

## Sobre

Este documento explica como configurar o sistema de notificações por email para enviar alertas sobre alterações nos horários de aulas.

## Configuração

### 1. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env` do projeto:

```
# Configurações de Email
EMAIL_HOST=smtp.gmail.com  # Servidor SMTP (ex: smtp.gmail.com, smtp.office365.com)
EMAIL_PORT=587             # Porta do servidor (normalmente 587 para TLS, 465 para SSL)
EMAIL_USER=seu-email@exemplo.com  # Email de envio
EMAIL_PASSWORD=sua-senha-ou-token # Senha ou token de aplicativo
EMAIL_FROM="Eugenio's Health Club <no-reply@eugenios.pt>"  # Nome e email do remetente
NOTIFICATION_EMAIL=programacoes@eugenios.pt  # Email que receberá as notificações
```

### 2. Usando Gmail

Se estiver usando Gmail, siga estes passos adicionais:

1. Ative a verificação em duas etapas na sua conta Google
2. Crie uma "Senha de App" específica para este aplicativo:
   - Acesse sua conta Google
   - Vá para "Segurança"
   - Em "Login no Google", selecione "Senhas de app"
   - Crie uma nova senha para o aplicativo "Eugenios HC"
   - Use esta senha gerada como `EMAIL_PASSWORD`

### 3. Usando Microsoft 365/Outlook

1. Acesse as configurações da sua conta Microsoft
2. Ative a autenticação em duas etapas se ainda não estiver ativa
3. Crie um "App Password" para uso no aplicativo
4. Use este token como `EMAIL_PASSWORD`

### 4. Usando Serviços Especializados

Para volumes maiores, considere usar serviços como:

- **SendGrid**: Configure `EMAIL_HOST=smtp.sendgrid.net` e use as credenciais API
- **Mailgun**: Configure `EMAIL_HOST=smtp.mailgun.org` e use as credenciais da API
- **Amazon SES**: Configure `EMAIL_HOST=email-smtp.us-east-1.amazonaws.com` (ou outra região) e use credenciais AWS

## Testes

Para testar se a configuração está funcionando:

1. Configure as variáveis de ambiente
2. Reinicie o servidor
3. Execute uma operação que ative um novo schedule

O sistema tentará enviar um email com as alterações e registrará sucesso ou falha nos logs.
