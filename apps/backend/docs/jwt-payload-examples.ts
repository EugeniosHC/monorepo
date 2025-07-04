/**
 * Exemplo de como o payload JWT chega no backend após decodificação
 *
 * Este é o formato dos dados que você terá disponível no ClerkUser
 * após a validação do token.
 */

// Exemplo de payload JWT decodificado que chegará do Clerk
const exampleJwtPayload = {
  // Campos padrão JWT
  aud: 'your-audience',
  exp: 1703980800, // timestamp de expiração
  iat: 1703977200, // timestamp de criação
  iss: 'https://clerk.your-domain.com', // issuer
  nbf: 1703977200, // not before
  sub: 'user_2abc123def456', // ID do usuário (userId)

  // Dados do usuário
  email: 'user@example.com',
  first_name: 'João',
  last_name: 'Silva',

  // Metadados (onde ficam os roles)
  public_metadata: {
    role: 'user',
    department: 'IT',
  },
  private_metadata: {
    role: 'admin', // Este terá prioridade sobre public_metadata
    permissions: ['read', 'write', 'delete'],
  },
};

// Como os dados são mapeados para ClerkUser
const mappedClerkUser = {
  userId: 'user_2abc123def456', // de payload.sub
  email: 'user@example.com', // de payload.email
  firstName: 'João', // de payload.first_name
  lastName: 'Silva', // de payload.last_name
  role: 'admin', // de private_metadata.role (prioridade)
};

/**
 * Configuração de roles no Clerk Dashboard
 */

// Exemplo de Private Metadata (recomendado - mais seguro)
const privateMetadataExample = {
  role: 'admin',
  permissions: ['users:read', 'users:write', 'users:delete'],
  department: 'IT',
  access_level: 5,
};

// Exemplo de Public Metadata (visível no frontend)
const publicMetadataExample = {
  role: 'user',
  display_name: 'João Silva',
  avatar_color: '#3b82f6',
};

/**
 * Diferentes níveis de acesso baseados em roles
 */
const rolePermissions = {
  admin: {
    routes: ['/admin/*', '/users/*', '/settings/*'],
    actions: ['create', 'read', 'update', 'delete', 'ban', 'promote'],
    description: 'Acesso total ao sistema',
  },

  moderator: {
    routes: ['/users/*', '/content/*'],
    actions: ['create', 'read', 'update', 'ban'],
    description: 'Pode moderar usuários e conteúdo',
  },

  user: {
    routes: ['/profile', '/dashboard'],
    actions: ['create', 'read', 'update'],
    description: 'Acesso básico do usuário',
  },
};

/**
 * Exemplo de como o token é usado nas requisições
 */
const requestExample = {
  method: 'GET',
  url: '/api/protected/admin',
  headers: {
    Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json',
  },
};

/**
 * Fluxo de autenticação completo
 */
const authFlow = {
  '1_frontend': "getToken({ template: 'NestJS Auth Template' })",
  '2_request': 'Authorization: Bearer <token>',
  '3_backend_guard': 'AuthGuard extrai e valida token',
  '4_backend_verify': 'verifyToken() do @clerk/backend',
  '5_backend_map': 'Mapeia payload para ClerkUser',
  '6_backend_roles': 'RolesGuard verifica permissões',
  '7_backend_access': 'Request.user disponível no controller',
};

export {
  exampleJwtPayload,
  mappedClerkUser,
  privateMetadataExample,
  publicMetadataExample,
  rolePermissions,
  authFlow,
};
