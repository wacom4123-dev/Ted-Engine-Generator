/**
 * TED Engine - Code Generation Logic
 */

export interface ProjectConfig {
  name: string;
  description: string;
  dbName: string;
  dbUser: string;
  dbPass: string;
  apiPort: number;
  features: string[];
  resources: Resource[];
  positions?: Record<string, { x: number, y: number }>;
}

export interface Resource {
  id: string;
  name: string;
  fields: Field[];
  softDelete?: boolean;
  auditLogs?: boolean;
  description?: string;
  module?: string;
}

export type RelationType = '1:1' | '1:N' | 'N:M';

export interface Field {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'relation';
  required: boolean;
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  defaultValue?: string;
  min?: number;
  max?: number;
  relationTo?: string;
  relationType?: RelationType;
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export const generateProject = (config: ProjectConfig, forceMobile?: boolean): GeneratedFile[] => {
  const files: GeneratedFile[] = [];

  // Helper to add files
  const addFile = (path: string, content: string) => files.push({ path, content });

  const generatePrismaSeed = () => {
    const sortedResources: any[] = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (res: any) => {
      if (visiting.has(res.id)) return;
      if (visited.has(res.id)) return;

      visiting.add(res.id);
      res.fields.forEach((field: any) => {
        if (field.type === 'relation') {
          const target = config.resources.find(r => r.name === field.relationTo);
          if (target && target.id !== res.id) {
            visit(target);
          }
        }
      });
      visiting.delete(res.id);
      visited.add(res.id);
      sortedResources.push(res);
    };

    config.resources.forEach(res => visit(res));

    let seed = `
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clear existing data
`;

    const reversedResources = [...sortedResources].reverse();
    reversedResources.forEach(res => {
      const prismaName = res.name.charAt(0).toLowerCase() + res.name.slice(1);
      seed += `  await prisma.${prismaName}.deleteMany({});\n`;
    });

    seed += `
  console.log('Cleared existing data.');

  // Create seed data
`;

    const hasUserResource = config.resources.some(r => r.name.toLowerCase() === 'user');
    if (!hasUserResource && (config.features.includes('JWT Auth') || config.features.includes('RBAC Roles'))) {
      seed += `
  // Seed default admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'System Admin',
      role: 'admin',
    },
  });
  console.log('Admin user created.');
`;
    }

    sortedResources.forEach(res => {
      const prismaName = res.name.charAt(0).toLowerCase() + res.name.slice(1);
      seed += `\n  // Seed ${res.name}\n`;
      for (let i = 1; i <= 3; i++) {
        const id = `${res.name.toLowerCase()}-${i}`;
        seed += `  await prisma.${prismaName}.upsert({\n`;
        seed += `    where: { id: '${id}' },\n`;
        seed += `    update: {},\n`;
        seed += `    create: {\n`;
        seed += `      id: '${id}',\n`;
        
        res.fields.forEach(field => {
          if (field.isPrimaryKey) return;
          
          if (field.type === 'relation') {
            const targetRes = config.resources.find(r => r.name === field.relationTo);
            if (targetRes) {
              const relType = field.relationType || '1:N';
              if (relType === '1:N' || relType === '1:1') {
                seed += `      ${field.name}Id: '${targetRes.name.toLowerCase()}-${i}',\n`;
              }
            }
          } else {
            let value: any;
            if (field.name === 'password') {
              value = `await bcrypt.hash('password123', 10)`;
            } else if (field.type === 'string') {
              if (field.name.includes('email')) value = `'${res.name.toLowerCase()}${i}@example.com'`;
              else if (field.name.includes('name')) value = `'${res.name} ${i}'`;
              else if (field.name.includes('username')) value = `'${res.name.toLowerCase()}${i}'`;
              else if (field.name.includes('sku')) value = `'SKU-${res.name.toUpperCase()}-${i}'`;
              else if (field.name.includes('phone')) value = `'555-010${i}'`;
              else if (field.name.includes('status')) {
                const statuses = ['OPEN', 'CLOSED', 'PENDING', 'COMPLETED', 'ACTIVE', 'INACTIVE'];
                value = `'${statuses[(i - 1) % statuses.length]}'`;
              } else value = `'Sample ${field.name} ${i}'`;
            } else if (field.type === 'number') {
              value = `${100 * i}`;
            } else if (field.type === 'boolean') {
              value = `true`;
            } else if (field.type === 'date') {
              value = `new Date()`;
            }
            
            if (value !== undefined) {
              seed += `      ${field.name}: ${value},\n`;
            }
          }
        });
        
        seed += `    }\n`;
        seed += `  });\n`;
      }
    });

    seed += `
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;
    return seed;
  };

  // Prisma Schema Generation Logic
  const generatePrismaSchema = () => {
    let schema = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`;

    const hasUserResource = config.resources.some(r => r.name.toLowerCase() === 'user');
    if (!hasUserResource && (config.features.includes('JWT Auth') || config.features.includes('RBAC Roles'))) {
      schema += `
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
    }

    const pluralize = (str: string) => {
      const lower = str.toLowerCase();
      if (lower.endsWith('y')) return str.slice(0, -1) + 'ies';
      if (lower.endsWith('s')) return str + 'es';
      return str + 's';
    };

    config.resources.forEach(res => {
      schema += `\nmodel ${res.name} {\n`;
      const addedFields = new Set<string>();
      
      res.fields.forEach(field => {
        if (addedFields.has(field.name)) return;
        addedFields.add(field.name);

        if (field.type === 'relation') {
          const targetRes = config.resources.find(r => r.name === field.relationTo);
          if (!targetRes) return;

          const relType = field.relationType || '1:N';
          const relationAttr = ` @relation("${res.name}_${field.name}")`;

          if (relType === '1:N') {
            schema += `  ${field.name} ${field.relationTo} @relation("${res.name}_${field.name}", fields: [${field.name}Id], references: [id])\n`;
            schema += `  ${field.name}Id String\n`;
            addedFields.add(`${field.name}Id`);
          } else if (relType === '1:1') {
            schema += `  ${field.name} ${field.relationTo} @relation("${res.name}_${field.name}", fields: [${field.name}Id], references: [id])\n`;
            schema += `  ${field.name}Id String @unique\n`;
            addedFields.add(`${field.name}Id`);
          } else if (relType === 'N:M') {
            schema += `  ${field.name} ${field.relationTo}[] @relation("${res.name}_${field.name}")\n`;
          }
        } else {
          let type = field.type === 'string' ? 'String' : 
                     field.type === 'number' ? 'Int' : 
                     field.type === 'boolean' ? 'Boolean' : 
                     field.type === 'date' ? 'DateTime' : 'String';
          
          let decorators = '';
          if (field.isPrimaryKey) decorators += ' @id @default(uuid())';
          if (field.isUnique && !field.isPrimaryKey) decorators += ' @unique';
          if (field.defaultValue !== undefined && field.defaultValue !== '') {
            const cleanDefaultValue = field.defaultValue.replace(/^["']|["']$/g, '');
            if (field.type === 'string') decorators += ` @default("${cleanDefaultValue}")`;
            else if (field.type === 'number') decorators += ` @default(${field.defaultValue})`;
            else if (field.type === 'boolean') decorators += ` @default(${field.defaultValue})`;
          }
          
          schema += `  ${field.name} ${type}${field.required ? '' : '?'}${decorators}\n`;
        }
      });

      // Add back-references
      config.resources.forEach(otherRes => {
        if (otherRes.id === res.id) return;
        otherRes.fields.forEach(otherField => {
          if (otherField.type === 'relation' && otherField.relationTo === res.name) {
            const relType = otherField.relationType || '1:N';
            const relationAttr = ` @relation("${otherRes.name}_${otherField.name}")`;
            
            let backRefName = '';
            if (otherField.name.toLowerCase() === res.name.toLowerCase()) {
              backRefName = relType === '1:1' ? otherRes.name.toLowerCase() : pluralize(otherRes.name.toLowerCase());
            } else {
              backRefName = relType === '1:1' ? `${otherField.name}${otherRes.name}` : pluralize(`${otherField.name}${otherRes.name}`);
            }

            if (!addedFields.has(backRefName)) {
              if (relType === '1:N' || relType === 'N:M') {
                schema += `  ${backRefName} ${otherRes.name}[]${relationAttr}\n`;
              } else {
                schema += `  ${backRefName} ${otherRes.name}?${relationAttr}\n`;
              }
              addedFields.add(backRefName);
            }
          }
        });
      });

      if (!addedFields.has('createdAt')) schema += `  createdAt DateTime @default(now())\n`;
      if (!addedFields.has('updatedAt')) schema += `  updatedAt DateTime @updatedAt\n`;
      if (res.softDelete && !addedFields.has('deletedAt')) {
        schema += `  deletedAt DateTime?\n`;
      }
      schema += `}\n`;
    });

    if (config.resources.some(r => r.auditLogs)) {
      schema += `\nmodel AuditLog {\n`;
      schema += `  id String @id @default(uuid())\n`;
      schema += `  resource String\n`;
      schema += `  resourceId String\n`;
      schema += `  action String\n`;
      schema += `  payload Json?\n`;
      schema += `  userId String?\n`;
      schema += `  createdAt DateTime @default(now())\n`;
      schema += `}\n`;
    }

    return schema;
  };

  // 0. Root Files
  addFile('package.json', JSON.stringify({
    name: config.name.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    private: true,
    scripts: {
      "install:all": "npm install --legacy-peer-deps && cd backend && npm install --legacy-peer-deps && cd ../frontend && npm install --legacy-peer-deps",
      "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
      "dev:backend": "cd backend && npm run dev",
      "dev:frontend": "cd frontend && npm run dev",
      "docker:up": "docker-compose up -d",
      "docker:down": "docker-compose down"
    },
    devDependencies: {
      "concurrently": "^9.1.0"
    }
  }, null, 2));

  addFile('.vscode/settings.json', JSON.stringify({
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    },
    "tailwindCSS.includeLanguages": {
      "typescript": "javascript",
      "typescriptreact": "javascript"
    },
    "explorer.compactFolders": false
  }, null, 2));

  addFile('.vscode/extensions.json', JSON.stringify({
    "recommendations": [
      "firsttris.vscode-jest-runner",
      "ms-azuretools.vscode-docker",
      "dbaeumer.vscode-eslint",
      "esbenp.prettier-vscode",
      "bradlc.vscode-tailwindcss",
      "prisma.prisma",
      "nestjs.nestjs-icarus"
    ]
  }, null, 2));

  addFile('.vscode/launch.json', JSON.stringify({
    "version": "0.2.0",
    "configurations": [
      {
        "type": "node",
        "request": "launch",
        "name": "Debug Backend (NestJS)",
        "args": ["start", "--debug", "--watch"],
        "cwd": "${workspaceFolder}/backend",
        "autoAttachChildProcesses": true,
        "protocol": "inspector",
        "runtimeExecutable": "npm"
      },
      {
        "type": "chrome",
        "request": "launch",
        "name": "Debug Frontend (Next.js)",
        "url": "http://localhost:3000",
        "webRoot": "${workspaceFolder}/frontend"
      }
    ]
  }, null, 2));

  addFile('.editorconfig', `
root = true

[*]
indent_style = space
indent_size = 2
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
end_of_line = lf

[*.md]
trim_trailing_whitespace = false
`);

  addFile('.gitignore', `
# dependencies
node_modules
.pnp
.pnp.js

# testing
coverage

# next.js
.next/
out/

# production
build
dist

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`);

  const envContent = `
# Database
DATABASE_URL="postgresql://${config.dbUser}:${config.dbPass}@localhost:5432/${config.dbName}?schema=public"

# API
PORT=${config.apiPort}

# AI
GEMINI_API_KEY=your_gemini_api_key_here

# Security
JWT_SECRET=your_jwt_secret_here
`;

  addFile('.env.example', envContent);
  addFile('.env', envContent);
  addFile('backend/.env', envContent);
  addFile('frontend/.env.local', `NEXT_PUBLIC_API_URL=http://localhost:${config.apiPort}/api`);

  // 1. Backend (NestJS)
  addFile('backend/package.json', JSON.stringify({
    name: `${config.name.toLowerCase().replace(/\s+/g, '-')}-backend`,
    version: '1.0.0',
    private: true,
    scripts: {
      "build": "nest build",
      "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
      "start": "nest start",
      "dev": "nest start --watch",
      "start:debug": "nest start --debug --watch",
      "start:prod": "node dist/main",
      "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
      "test": "jest",
      "test:watch": "jest --watch",
      "test:cov": "jest --coverage",
      "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
      "test:e2e": "jest --config ./test/jest-e2e.json"
    },
    prisma: {
      seed: "ts-node prisma/seed.ts"
    },
    dependencies: {
      '@nestjs/common': '^11.0.0',
      '@nestjs/core': '^11.0.0',
      '@nestjs/platform-express': '^11.0.0',
      '@nestjs/swagger': '^11.0.0',
      '@prisma/client': '^6.19.1',
      'reflect-metadata': '^0.2.0',
      'rxjs': '^7.8.1',
      'zod': '^3.23.8',
      'bcryptjs': '^2.4.3',
      'jsonwebtoken': '^9.0.2',
      'helmet': '^7.1.0',
      'cors': '^2.8.5',
      'morgan': '^1.10.0',
      'winston': '^3.14.2',
      'class-transformer': '^0.5.1',
      'class-validator': '^0.14.1',
      ...(config.features.includes('GraphQL') ? {
        '@nestjs/graphql': '^13.0.0',
        '@nestjs/apollo': '^13.0.0',
        '@apollo/server': '^5.0.0',
        'graphql': '^16.10.0',
      } : {}),
      ...(config.features.includes('File Upload') ? {
        'multer': '^1.4.5-lts.1',
        '@types/multer': '^1.4.11',
      } : {}),
      ...(config.features.includes('Socket.io') || config.features.includes('WebSockets') ? {
        '@nestjs/websockets': '^11.0.0',
        '@nestjs/platform-socket.io': '^11.0.0',
        'socket.io': '^4.7.5',
      } : {}),
      ...(config.features.includes('BullMQ Queue') ? {
        '@nestjs/bullmq': '^11.0.0',
        'bullmq': '^5.12.0',
      } : {}),
      ...(config.features.includes('Gzip Compression') ? { 'compression': '^1.7.4' } : {}),
      ...(config.features.includes('XSS Protection') ? { 'csurf': '^1.11.0' } : {}),
      ...(config.features.includes('JWT Auth') || config.features.includes('RBAC Roles') ? {
        '@nestjs/jwt': '^11.0.0',
        '@nestjs/passport': '^11.0.0',
        'passport': '^0.7.0',
        'passport-jwt': '^4.0.1',
      } : {}),
    },
    devDependencies: {
      '@nestjs/cli': '^11.0.0',
      '@nestjs/schematics': '^11.0.0',
      '@nestjs/testing': '^11.0.0',
      '@types/express': '^4.17.17',
      '@types/jest': '^29.5.2',
      '@types/node': '^22.0.0',
      '@types/supertest': '^6.0.0',
      '@types/bcryptjs': '^2.4.6',
      '@types/jsonwebtoken': '^9.0.7',
      '@types/morgan': '^1.9.9',
      '@types/compression': '^1.7.5',
      '@types/csurf': '^1.11.5',
      '@typescript-eslint/eslint-plugin': '^8.0.0',
      '@typescript-eslint/parser': '^8.0.0',
      'eslint': '^8.42.0',
      'eslint-config-prettier': '^9.0.0',
      'eslint-plugin-prettier': '^5.0.0',
      'jest': '^29.5.0',
      'prettier': '^3.0.0',
      'source-map-support': '^0.5.21',
      'supertest': '^7.0.0',
      'ts-jest': '^29.1.0',
      'ts-loader': '^9.4.3',
      'ts-node': '^10.9.1',
      'tsconfig-paths': '^4.2.0',
      'typescript': '^5.4.5',
      'prisma': '^6.19.1',
    }
  }, null, 2));

  addFile('backend/tsconfig.json', JSON.stringify({
    compilerOptions: {
      module: 'commonjs',
      declaration: true,
      removeComments: true,
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      allowSyntheticDefaultImports: true,
      target: 'ES2021',
      esModuleInterop: true,
      sourceMap: true,
      outDir: './dist',
      baseUrl: './',
      incremental: true,
      skipLibCheck: true,
      strictNullChecks: false,
      noImplicitAny: false,
      strictBindCallApply: false,
      forceConsistentCasingInFileNames: false,
      noFallthroughCasesInSwitch: false,
    }
  }, null, 2));

  addFile('backend/nest-cli.json', JSON.stringify({
    $schema: 'https://json.schemastore.org/nest-cli',
    collection: '@nestjs/schematics',
    sourceRoot: 'src',
    compilerOptions: {
      deleteOutDir: true
    }
  }, null, 2));

  addFile('backend/src/main.ts', `
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
${config.features.includes('Helmet.js') || config.features.includes('OWASP Headers') ? "import helmet from 'helmet';" : ''}
${config.features.includes('Gzip Compression') ? "import * as compression from 'compression';" : ''}
${config.features.includes('XSS Protection') ? "import * as csurf from 'csurf';" : ''}
${config.features.includes('Winston Logging') ? "import { logger } from './common/logger';" : ''}
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  ${config.features.includes('Helmet.js') || config.features.includes('OWASP Headers') ? "app.use(helmet());" : ''}
  ${config.features.includes('Gzip Compression') ? "app.use(compression());" : ''}
  ${config.features.includes('XSS Protection') ? "app.use(csurf());" : ''}
  
  ${config.features.includes('Winston Logging') ? `
  app.use((morgan as any)('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
  ` : `
  app.use((morgan as any)('dev'));
  `}

  ${config.features.includes('CORS Config') ? "app.enableCors();" : ''}
  
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  const { TransformInterceptor } = await import('./common/interceptors/transform.interceptor');
  const { HttpExceptionFilter } = await import('./common/filters/http-exception.filter');
  
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  
  ${config.features.includes('Graceful Shutdown') ? `
  app.enableShutdownHooks();
  ` : ''}
  
  ${config.features.includes('Swagger UI') ? `
  const swaggerConfig = new DocumentBuilder()
    .setTitle('${config.name} API')
    .setDescription('${config.description}')
    .setVersion('1.0')
    ${config.features.includes('API Key Auth') ? ".addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')" : ''}
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
  ` : ''}

  const port = process.env.PORT || ${config.apiPort};
  
  ${config.features.includes('Graceful Shutdown') ? "app.enableShutdownHooks();" : ''}
  
  await app.listen(port, '0.0.0.0');
  console.log(\`Backend running on: http://localhost:\${port}\`);
}
bootstrap();
  `);

  addFile('backend/src/app.module.ts', `
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
${config.resources.map(res => `import { ${res.name}Module } from './${res.name.toLowerCase()}/${res.name.toLowerCase()}.module';`).join('\n')}
${config.features.includes('JWT Auth') || config.features.includes('RBAC Roles') ? "import { AuthModule } from './auth/auth.module';" : ''}
${config.features.includes('Socket.io') || config.features.includes('WebSockets') ? "import { EventsModule } from './events/events.module';" : ''}
${config.features.includes('Health Checks') || config.features.includes('Health Advanced') ? "import { HealthModule } from './health/health.module';" : ''}
${config.features.includes('File Upload') ? "import { UploadController } from './common/controllers/upload.controller';" : ''}
${config.resources.some(r => r.auditLogs) ? "import { AuditController } from './common/controllers/audit.controller';" : ''}
${config.features.includes('GraphQL') ? "import { GraphQLModule } from '@nestjs/graphql';\nimport { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';\nimport { join } from 'path';" : ''}

@Module({
  imports: [
    PrismaModule,
    ${config.resources.map(res => `${res.name}Module,`).join('\n    ')}
    ${config.features.includes('JWT Auth') || config.features.includes('RBAC Roles') ? "AuthModule," : ''}
    ${config.features.includes('Socket.io') || config.features.includes('WebSockets') ? "EventsModule," : ''}
    ${config.features.includes('Health Checks') || config.features.includes('Health Advanced') ? "HealthModule," : ''}
    ${config.features.includes('GraphQL') ? `GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),` : ''}
  ],
  controllers: [
    AppController,
    ${config.features.includes('File Upload') ? "UploadController," : ''}
    ${config.resources.some(r => r.auditLogs) ? "AuditController," : ''}
  ],
  providers: [AppService],
})
export class AppModule {}
  `);

  addFile('backend/src/app.controller.ts', `
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('General')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Welcome message' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
  `);

  if (config.features.includes('File Upload')) {
    addFile('backend/src/common/controllers/upload.controller.ts', `
import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a file' })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    // In a real app, you would upload to S3 or similar
    return {
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: \`https://picsum.photos/seed/\${file.originalname}/800/600\`, // Mock URL
    };
  }
}
    `);
  }

  if (config.resources.some(r => r.auditLogs)) {
    addFile('backend/src/common/controllers/audit.controller.ts', `
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all audit logs' })
  async findAll(
    @Query('resource') resource?: string,
    @Query('resourceId') resourceId?: string,
  ) {
    return this.prisma.auditLog.findMany({
      where: {
        resource,
        resourceId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
    `);
  }

  addFile('backend/src/app.service.ts', `
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to ${config.name} API';
  }
}
  `);

  addFile('backend/src/prisma/prisma.service.ts', `
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
  `);

  addFile('backend/src/prisma/prisma.module.ts', `
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
  `);

  addFile('backend/src/common/interceptors/transform.interceptor.ts', `
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map(data => ({ 
      statusCode: context.switchToHttp().getResponse().statusCode,
      data 
    })));
  }
}
  `);

  addFile('backend/src/common/filters/http-exception.filter.ts', `
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: (exceptionResponse as any).message || exception.message || null,
      });
  }
}
  `);

  addFile('backend/prisma/schema.prisma', generatePrismaSchema());
  addFile('backend/prisma/seed.ts', generatePrismaSeed());

  // 2. Frontend (Next.js)
  addFile('frontend/src/providers/query-provider.tsx', `
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
  `);

  addFile('frontend/src/services/api.ts', `
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:${config.apiPort}/api',
});

${config.features.includes('Retry Logic') ? `
api.interceptors.response.use(undefined, (err) => {
  const { config, response } = err;
  if (!config || !config.retry) return Promise.reject(err);
  config.retryCount = config.retryCount || 0;
  if (config.retryCount >= config.retry) return Promise.reject(err);
  config.retryCount += 1;
  const backoff = new Promise((resolve) => {
    setTimeout(() => resolve(null), config.retryDelay || 1000);
  });
  return backoff.then(() => axios(config));
});
` : ''}

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

export default api;
  `);

  addFile('frontend/src/store/use-auth-store.ts', `
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name?: string;
  roles?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
  `);

  if (config.features.includes('Auth Pages') || config.features.includes('User Signup')) {
    if (config.features.includes('Profile Setup')) {
      addFile('frontend/src/app/profile/page.tsx', `
'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/use-auth-store';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { User, Mail, Shield, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.patch('/auth/profile', { name });
      setAuth(res.data, localStorage.getItem('token') || '');
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-[#e63946] p-8 text-white">
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-white/80">Manage your account information</p>
        </div>
        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#e63946] focus:border-transparent transition-all"
                  placeholder="Your Name"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#e63946] text-white font-bold rounded-xl hover:bg-[#d62839] transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
      `);
    }

    addFile('frontend/src/app/login/page.tsx', `
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.user, res.data.access_token);
      toast.success('Login successful!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-[#e63946] rounded-xl flex items-center justify-center text-white shadow-lg">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your credentials to access the dashboard</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#e63946] focus:border-[#e63946] sm:text-sm"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#e63946] focus:border-[#e63946] sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#e63946] hover:bg-[#d62839] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e63946] transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="font-medium text-[#e63946] hover:text-[#d62839]">
                Register here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
    `);

    addFile('frontend/src/app/register/page.tsx', `
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { Zap } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { email, password, name });
      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-[#e63946] rounded-xl flex items-center justify-center text-white shadow-lg">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">Join us to start managing your enterprise</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#e63946] focus:border-[#e63946] sm:text-sm"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#e63946] focus:border-[#e63946] sm:text-sm"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#e63946] focus:border-[#e63946] sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#e63946] hover:bg-[#d62839] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e63946] transition-all disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-[#e63946] hover:text-[#d62839]">
                Sign in here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
    `);
  }

  addFile('frontend/tailwind.config.ts', `
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
  `);

  addFile('frontend/postcss.config.mjs', `
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;
  `);

  addFile('frontend/src/app/globals.css', `
@import "tailwindcss";

@plugin "tailwindcss-animate";

@custom-variant dark (&:is(.dark *));

@theme {
  --font-sans: var(--font-inter);
  --font-mono: var(--font-roboto-mono);
}

:root {
  --background: #ffffff;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --popover: #ffffff;
  --popover-foreground: #0f172a;
  --primary: #10b981;
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --secondary-foreground: #0f172a;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --accent: #f1f5f9;
  --accent-foreground: #0f172a;
  --destructive: #ef4444;
  --destructive-foreground: #f8fafc;
  --border: #e2e8f0;
  --input: #e2e8f0;
  --ring: #10b981;
  --radius: 0.75rem;
}

.dark {
  --background: #020617;
  --foreground: #f8fafc;
  --card: #020617;
  --card-foreground: #f8fafc;
  --popover: #020617;
  --popover-foreground: #f8fafc;
  --primary: #10b981;
  --primary-foreground: #ffffff;
  --secondary: #1e293b;
  --secondary-foreground: #f8fafc;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;
  --accent: #1e293b;
  --accent-foreground: #f8fafc;
  --destructive: #7f1d1d;
  --destructive-foreground: #f8fafc;
  --border: #1e293b;
  --input: #1e293b;
  --ring: #10b981;
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
  `);

  addFile('frontend/src/components/ui/skeleton.tsx', `
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-800", className)}
      {...props}
    />
  )
}

export { Skeleton }
  `);

  addFile('frontend/src/components/error-boundary.tsx', `
'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-[#e63946] text-white rounded-xl font-bold hover:bg-[#d62839] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
  `);

  addFile('frontend/src/components/ui/data-table.tsx', `
'use client';
import { useState } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  loading?: boolean;
}

export function DataTable<T extends { id: string | number }>({ 
  data, 
  columns, 
  onEdit, 
  onDelete,
  loading 
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = data.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-bottom border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search all columns..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#e63946] transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-all">
            <Filter className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-all">
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-8 ml-auto" />
                  </td>
                </tr>
              ))
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-all group">
                  {columns.map((col, i) => (
                    <td key={i} className="px-6 py-4 text-sm text-gray-600">
                      {typeof col.accessor === 'function' 
                        ? col.accessor(item) 
                        : String(item[col.accessor] ?? '-')}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            onClick={() => onDelete(item)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-50 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-900">{Math.min(filteredData.length, (page - 1) * itemsPerPage + 1)}</span> to <span className="font-medium text-gray-900">{Math.min(filteredData.length, page * itemsPerPage)}</span> of <span className="font-medium text-gray-900">{filteredData.length}</span> results
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-all disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-all disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
  `);
  addFile('frontend/package.json', JSON.stringify({
    name: `${config.name.toLowerCase().replace(/\s+/g, '-')}-frontend`,
    version: '1.0.0',
    private: true,
    scripts: {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint"
    },
    dependencies: {
      'next': '15.1.0',
      'react': '^19.0.0',
      'react-dom': '^19.0.0',
      'lucide-react': '^0.546.0',
      'zustand': '^5.0.2',
      'axios': '^1.7.9',
      '@tanstack/react-query': '^5.62.0',
      'react-hook-form': '^7.53.0',
      'zod': '^3.23.8',
      '@hookform/resolvers': '^3.9.0',
      'react-hot-toast': '^2.4.1',
      'motion': '^12.0.0',
      'clsx': '^2.1.1',
      'tailwind-merge': '^2.5.2',
      'tailwindcss-animate': '^1.0.7',
      'tailwindcss': '^4.0.0',
      '@tailwindcss/postcss': '^4.0.0',
      ...(config.features.includes('Charts (Recharts)') ? { 'recharts': '^2.12.7' } : {}),
      ...(config.features.includes('Shadcn UI') ? { 
        'class-variance-authority': '^0.7.0',
        '@radix-ui/react-slot': '^1.1.0',
      } : {}),
      ...(config.features.includes('Socket.io') ? { 'socket.io-client': '^4.7.5' } : {}),
    },
    devDependencies: {
      'postcss': '^8.4.0',
      'autoprefixer': '^10.4.0',
      'typescript': '^5.4.5',
      '@types/node': '^22.0.0',
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      'eslint': '^8.0.0',
      'eslint-config-next': '15.1.0',
    }
  }, null, 2));

  addFile('frontend/tsconfig.json', JSON.stringify({
    compilerOptions: {
      target: 'es5',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'node',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      plugins: [
        {
          name: 'next'
        }
      ],
      paths: {
        '@/*': ['./src/*']
      }
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules']
  }, null, 2));

  addFile('frontend/next.config.js', `
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
  `);

  const isDashboard = config.features.includes('dashboard');
  const hasHalaman = config.features.includes('halaman');

  addFile('frontend/src/app/layout.tsx', `
'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { Zap, Home, BarChart2, Users, Package, Folder, Settings, Search, Bell, Box } from 'lucide-react';
import Link from 'next/link';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const isDashboard = ${isDashboard};
  const hasHalaman = ${hasHalaman};
  const resources = ${JSON.stringify(config.resources)};

  if (!isDashboard) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <div className="flex h-screen bg-[#f8f9fa] text-gray-800 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-20 lg:w-64 bg-[#e63946] flex flex-col items-center py-8 gap-8 transition-all">
              <Link href="/" className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Zap className="w-6 h-6" />
              </Link>
              <nav className="flex flex-col gap-6 w-full px-4">
                <Link href="/" className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all group text-white/60 hover:text-white hover:bg-white/5">
                  <div className="shrink-0"><Home className="w-5 h-5" /></div>
                  <span className="hidden lg:block text-sm font-semibold">Dashboard</span>
                </Link>
                
                {hasHalaman && resources.map((res: any) => (
                  <Link 
                    key={res.name} 
                    href={\`/\${res.name.toLowerCase()}\`}
                    className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all group text-white/60 hover:text-white hover:bg-white/5"
                  >
                    <div className="shrink-0"><Box className="w-5 h-5" /></div>
                    <span className="hidden lg:block text-sm font-semibold capitalize">{res.name}</span>
                  </Link>
                ))}

                <div className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all group text-white/60 hover:text-white hover:bg-white/5">
                  <div className="shrink-0"><Settings className="w-5 h-5" /></div>
                  <span className="hidden lg:block text-sm font-semibold">Settings</span>
                </div>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
              {/* Top Bar */}
              <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8">
                <div className="flex items-center gap-4 bg-gray-50 px-4 py-2.5 rounded-xl w-full max-w-md border border-gray-100">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search anything..." className="bg-transparent border-none focus:outline-none text-sm w-full" />
                </div>
                <div className="flex items-center gap-6">
                  <div className="relative p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-bold">Alex Johnson</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Administrator</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shadow-inner">AJ</div>
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[#f8f9fa]">
                {children}
              </div>
            </main>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
  `);

  addFile('frontend/src/components/DashboardPreview.tsx', `
'use client';

import { TrendingUp, TrendingDown, MoreVertical, Users, Package, BarChart2, Box, Layers, ChevronRight, Activity, Database, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function DashboardPreview({ resources, hasHalaman }: { resources: any[], hasHalaman: boolean }) {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const modules = Array.from(new Set(resources.map(r => r.module).filter(Boolean))) as string[];

  if (!selectedModule) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Global ERP Dashboard</h2>
            <p className="text-sm text-gray-500">Overview of all enterprise modules.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">System Health</button>
            <button className="bg-[#e63946] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">Global Report</button>
          </div>
        </div>

        {/* Module Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => {
            const moduleResources = resources.filter(r => r.module === mod);
            return (
              <div 
                key={mod} 
                onClick={() => setSelectedModule(mod)}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Layers className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-all" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900">{mod}</h3>
                  <p className="text-xs text-gray-500">{moduleResources.length} Resources</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {moduleResources.slice(0, 3).map(res => (
                    <span key={res.name} className="px-2 py-1 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-md uppercase tracking-wider">
                      {res.name}
                    </span>
                  ))}
                  {moduleResources.length > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-md">
                      +\${moduleResources.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Revenue', value: '$2.4M', trend: '+15%', icon: <TrendingUp className="w-4 h-4" />, color: 'bg-emerald-500' },
            { label: 'Total Employees', value: '850', trend: '+5%', icon: <Users className="w-4 h-4" />, color: 'bg-indigo-500' },
            { label: 'Open Orders', value: '124', trend: '-2%', icon: <Package className="w-4 h-4" />, color: 'bg-orange-500' },
            { label: 'System Uptime', value: '99.9%', trend: 'Stable', icon: <Activity className="w-4 h-4" />, color: 'bg-purple-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={\`w-10 h-10 \${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg\`}>
                  {stat.icon}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const moduleResources = resources.filter(r => r.module === selectedModule);
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
        <button onClick={() => setSelectedModule(null)} className="hover:text-indigo-600 transition-colors">Dashboard</button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-bold">{selectedModule}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">{selectedModule} Dashboard</h2>
          <p className="text-sm text-gray-500">Manage resources and view analytics for {selectedModule}.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">Module Settings</button>
          <button className="bg-[#e63946] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">Add Resource</button>
        </div>
      </div>

      {/* Module Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Records', value: '1,240', icon: <Database className="w-4 h-4" />, color: 'bg-blue-500' },
          { label: 'Active Items', value: '856', icon: <Activity className="w-4 h-4" />, color: 'bg-emerald-500' },
          { label: 'Pending Actions', value: '12', icon: <Zap className="w-4 h-4" />, color: 'bg-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={\`w-12 h-12 \${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg\`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resources Section (If Halaman is enabled) */}
      {hasHalaman && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Module Resources</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {moduleResources.map((res) => (
              <Link 
                key={res.name} 
                href={\`/\${res.name.toLowerCase()}\`}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center gap-4 group"
              >
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 capitalize">{res.name}</div>
                  <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Manage {res.name.toLowerCase()}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Table & Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Recent Projects</h3>
            <button className="text-indigo-600 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="px-6 py-4">Project Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { name: 'E-commerce Platform', status: 'In Progress', color: 'text-orange-500 bg-orange-50', progress: 65, date: 'Oct 12, 2023' },
                  { name: 'Mobile App Design', status: 'Completed', color: 'text-emerald-500 bg-emerald-50', progress: 100, date: 'Sep 28, 2023' },
                  { name: 'Marketing Dashboard', status: 'Review', color: 'text-indigo-500 bg-indigo-50', progress: 85, date: 'Oct 05, 2023' },
                  { name: 'API Integration', status: 'Delayed', color: 'text-red-500 bg-red-50', progress: 40, date: 'Oct 15, 2023' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{row.name}</td>
                    <td className="px-6 py-4">
                      <span className={\`px-3 py-1 rounded-full text-[10px] font-bold \${row.color}\`}>{row.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className={\`h-full \${row.color.split(' ')[0].replace('text-', 'bg-')}\`} style={{ width: \`\${row.progress}%\` }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 font-medium">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Team Performance</h3>
            <MoreVertical className="w-4 h-4 text-gray-300" />
          </div>
          <div className="flex-1 flex items-center justify-center relative py-8">
            <div className="w-40 h-40 rounded-full border-[12px] border-gray-100 relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[12px] border-indigo-500 border-t-transparent border-r-transparent -rotate-45"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">82%</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Efficiency</div>
              </div>
            </div>
          </div>
          <button className="w-full py-3 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all">View Full Report</button>
        </div>
      </div>
    </div>
  );
}
  `);

  addFile('frontend/src/app/page.tsx', `
import { TrendingUp, TrendingDown, MoreVertical, Users, Package, BarChart2, Zap, ChevronDown, UserPlus } from 'lucide-react';
import DashboardPreview from '@/components/DashboardPreview';

export default function Home() {
  const isDashboard = ${isDashboard};
  const hasHalaman = ${hasHalaman};
  const resources = ${JSON.stringify(config.resources)};

  if (!isDashboard) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-orange-500/30">
        {/* Navbar */}
        <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-50 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">${config.name}</span>
          </div>
          <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-gray-400">
            <div className="flex items-center gap-1 cursor-pointer hover:text-orange-500 transition-colors">Product <ChevronDown className="w-3 h-3" /></div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-orange-500 transition-colors">Docs <ChevronDown className="w-3 h-3" /></div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-orange-500 transition-colors">Resources <ChevronDown className="w-3 h-3" /></div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-orange-500 transition-colors">Pricing <ChevronDown className="w-3 h-3" /></div>
            <a href="#" className="hover:text-orange-500 transition-colors">Blog</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:text-white transition-colors"><UserPlus className="w-5 h-5" /></button>
            <button className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-200 transition-all shadow-lg shadow-white/10">
              Book a demo
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-16 pb-32 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center space-y-10 relative z-10">
            <h1 className="text-6xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight max-w-4xl mx-auto">
              Build Systems That Power <br />
              <span className="text-orange-500">Your Operations</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              ${config.name} connects no-code tools with ERP systems, uniting engineers and operators to tackle key operational challenges.
            </p>
            <button className="bg-orange-500 text-white px-10 py-4 rounded-full font-bold hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20">
              Get started
            </button>
          </div>

          <div className="max-w-5xl mx-auto mt-20 relative">
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-[#1a1a1a]">
              <img 
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop" 
                alt="Futuristic Tech" 
                className="w-full h-[600px] object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent"></div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return <DashboardPreview resources={resources} hasHalaman={hasHalaman} />;
}
  `);

  if (hasHalaman) {
    config.resources.forEach((res: any) => {
      addFile(`frontend/src/app/${res.name.toLowerCase()}/page.tsx`, `
'use client';

import { Search, Plus, MoreVertical, ChevronDown, Box, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function ${res.name}Page() {
  const resource = ${JSON.stringify(res)};
  const fields = resource.fields;

  const { data, isLoading, error } = useQuery({
    queryKey: ['${res.name.toLowerCase()}'],
    queryFn: async () => {
      // In a real app, this would be: const res = await axios.get(\`/api/\${resource.name.toLowerCase()}\`);
      // For now, we simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [1, 2, 3, 4, 5].map(i => {
        const item: any = { id: i };
        fields.forEach((f: any) => {
          item[f.name] = f.type === 'number' ? Math.floor(Math.random() * 1000) : \`Sample \${f.name} \${i}\`;
        });
        return item;
      });
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900 capitalize">\${resource.name} Management</h2>
          <p className="text-sm text-gray-500">Manage your \${resource.name.toLowerCase()} data efficiently.</p>
        </div>
        <button className="bg-[#e63946] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add \${res.name}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 w-full max-w-xs">
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search..." className="bg-transparent border-none focus:outline-none text-sm w-full" />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-2">
              Filter <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                {fields.map((field: any) => (
                  <th key={field.name} className="px-6 py-4 capitalize">{field.name}</th>
                ))}
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={fields.length + 1} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-sm font-medium">Loading data...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  {fields.map((field: any) => (
                    <td key={field.name} className="px-6 py-4 text-sm text-gray-600">
                      {item[field.name]}
                    </td>
                  ))}
                  <td className="px-6 py-4">
                    <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium">Showing {data?.length || 0} of 24 entries</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-100 rounded-lg text-xs font-bold text-gray-400 cursor-not-allowed">Prev</button>
            <button className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-xs font-bold">1</button>
            <button className="px-3 py-1 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">2</button>
            <button className="px-3 py-1 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
      `);
    });
  }

  addFile('backend/Dockerfile', `
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
EXPOSE ${config.apiPort}
CMD ["npm", "run", "start:prod"]
  `);

  addFile('frontend/Dockerfile', `
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
EXPOSE 3000
CMD ["npm", "run", "start"]
  `);

  addFile('docker-compose.yml', `
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: ${config.dbUser}
      POSTGRES_PASSWORD: ${config.dbPass}
      POSTGRES_DB: ${config.dbName}
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "${config.apiPort}:${config.apiPort}"
    environment:
      DATABASE_URL: "postgresql://${config.dbUser}:${config.dbPass}@postgres:5432/${config.dbName}?schema=public"
      PORT: ${config.apiPort}
      JWT_SECRET: "secret"
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: "http://localhost:${config.apiPort}"
    depends_on:
      - backend
  `);

  addFile('README.md', `
# ${config.name}

${config.description}

## Project Structure
- \`backend/\`: NestJS API with Prisma ORM
- \`frontend/\`: Next.js 15 application with TailwindCSS
- \`docker-compose.yml\`: Infrastructure (PostgreSQL, Redis)

## Prerequisites
- Node.js >= 22.0.0
- Docker Desktop (for Database & Redis)
- Google Gemini API Key (for AI features)

## Getting Started

### 1. Setup Environment Variables
The \`.env\` files are already generated in the root and \`backend/\` folders.
You can adjust them if needed.

### 2. Install All Dependencies
From the root directory, run:
\`\`\`bash
npm run install:all
\`\`\`

### 3. Start Infrastructure
\`\`\`bash
npm run docker:up
\`\`\`

### 4. Setup Database
\`\`\`bash
cd backend
npx prisma generate
npx prisma db push
\`\`\`

### 5. Run Development Servers
You can run both servers from the root in separate terminals:
\`\`\`bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
\`\`\`

## API Documentation
Once the backend is running, access Swagger UI at:
\`http://localhost:${config.apiPort}/api/docs\`

## Tech Stack
- **Backend:** NestJS, Prisma, PostgreSQL, Swagger
- **Frontend:** Next.js 15, TailwindCSS, TanStack Query, Zustand, Framer Motion
- **AI:** Google Gemini SDK
`);

  // 3. Feature-specific Generation
  const generateFeatureFiles = () => {
    // Resource-specific Backend (NestJS)
    config.resources.forEach(res => {
      const name = res.name.toLowerCase();
      const Name = res.name;
      const prismaName = Name.charAt(0).toLowerCase() + Name.slice(1);

      addFile(`backend/src/${name}/${name}.module.ts`, `
import { Module } from '@nestjs/common';
import { ${Name}Service } from './${name}.service';
import { ${Name}Controller } from './${name}.controller';

@Module({
  controllers: [${Name}Controller],
  providers: [${Name}Service],
})
export class ${Name}Module {}
      `);

      addFile(`backend/src/${name}/${name}.service.ts`, `
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Create${Name}Dto } from './dto/create-${name}.dto';
import { Update${Name}Dto } from './dto/update-${name}.dto';

@Injectable()
export class ${Name}Service {
  constructor(private prisma: PrismaService) {}

  async create(dto: Create${Name}Dto) {
    const { ${res.fields.filter(f => f.type === 'relation').map(f => `${f.name}Id`).join(', ')}${res.fields.some(f => f.type === 'relation') ? ', ' : ''}...data } = dto;
    const result = await this.prisma.${prismaName}.create({ 
      data: {
        ...data,
        ${res.fields.filter(f => f.type === 'relation').map(f => `
        ${f.name}: ${f.name}Id ? { connect: { id: ${f.name}Id } } : undefined,
        `).join('\n        ')}
      } 
    });
    ${res.auditLogs ? `await this.prisma.auditLog.create({ data: { resource: '${Name}', resourceId: (result as any).id, action: 'CREATE', payload: dto as any } });` : ''}
    return result;
  }

  async findAll(query?: any) {
    const { page = 1, limit = 10, ...filters } = query || {};
    const where = { 
      ...filters,
      ${res.softDelete ? 'deletedAt: null' : ''}
    };
    return this.prisma.${prismaName}.findMany({
      where,
      skip: (page - 1) * limit,
      take: +limit,
      include: {
        ${res.fields.filter(f => f.type === 'relation').map(f => `${f.name}: true`).join(',\n        ')}
      }
    });
  }

  async findOne(id: string) {
    const result = await this.prisma.${prismaName}.findUnique({ 
      where: { id },
      include: {
        ${res.fields.filter(f => f.type === 'relation').map(f => `${f.name}: true`).join(',\n        ')}
      }
    });
    if (!result ${res.softDelete ? '|| (result as any).deletedAt' : ''}) throw new NotFoundException();
    return result;
  }

  async update(id: string, dto: Update${Name}Dto) {
    const { ${res.fields.filter(f => f.type === 'relation').map(f => `${f.name}Id`).join(', ')}${res.fields.some(f => f.type === 'relation') ? ', ' : ''}...data } = dto;
    const result = await this.prisma.${prismaName}.update({ 
      where: { id }, 
      data: {
        ...data,
        ${res.fields.filter(f => f.type === 'relation').map(f => `
        ${f.name}: ${f.name}Id ? { connect: { id: ${f.name}Id } } : undefined,
        `).join('\n        ')}
      } 
    });
    ${res.auditLogs ? `await this.prisma.auditLog.create({ data: { resource: '${Name}', resourceId: id, action: 'UPDATE', payload: dto as any } });` : ''}
    return result;
  }

  async remove(id: string) {
    ${res.softDelete ? `
    const result = await this.prisma.${prismaName}.update({ where: { id }, data: { deletedAt: new Date() } });
    ` : `
    const result = await this.prisma.${prismaName}.delete({ where: { id } });
    `}
    ${res.auditLogs ? `await this.prisma.auditLog.create({ data: { resource: '${Name}', resourceId: id, action: 'DELETE' } });` : ''}
    return result;
  }
}
      `);

      addFile(`backend/src/${name}/dto/create-${name}.dto.ts`, `
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsNotEmpty } from 'class-validator';

export class Create${Name}Dto {
  ${res.fields.map(f => `
  @ApiProperty({ required: ${f.required} })
  ${f.required ? '@IsNotEmpty()' : '@IsOptional()'}
  ${f.type === 'string' ? '@IsString()' : f.type === 'number' ? '@IsNumber()' : f.type === 'boolean' ? '@IsBoolean()' : f.type === 'date' ? '@IsDate()' : f.type === 'relation' ? '@IsString()' : ''}
  ${f.name}${f.type === 'relation' ? 'Id' : ''}: ${f.type === 'string' ? 'string' : f.type === 'number' ? 'number' : f.type === 'boolean' ? 'boolean' : f.type === 'date' ? 'Date' : f.type === 'relation' ? 'string' : 'any'};
  `).join('\n')}
}
      `);

      addFile(`backend/src/${name}/dto/update-${name}.dto.ts`, `
import { PartialType } from '@nestjs/swagger';
import { Create${Name}Dto } from './create-${name}.dto';

export class Update${Name}Dto extends PartialType(Create${Name}Dto) {}
      `);

      addFile(`backend/src/${name}/${name}.controller.ts`, `
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ${Name}Service } from './${name}.service';
import { Create${Name}Dto } from './dto/create-${name}.dto';
import { Update${Name}Dto } from './dto/update-${name}.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
${config.features.includes('JWT Auth') ? "import { JwtAuthGuard } from '../auth/jwt-auth.guard';" : ''}

@ApiTags('${Name}')
@Controller('${name}')
export class ${Name}Controller {
  constructor(private readonly ${name}Service: ${Name}Service) {}

  @Post()
  ${config.features.includes('JWT Auth') ? "@UseGuards(JwtAuthGuard)\n  @ApiBearerAuth()" : ''}
  @ApiOperation({ summary: 'Create a new ${name}' })
  create(@Body() data: Create${Name}Dto) {
    return this.${name}Service.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ${name}s' })
  findAll(@Query() query: any) {
    return this.${name}Service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ${name} by id' })
  findOne(@Param('id') id: string) {
    return this.${name}Service.findOne(id);
  }

  @Patch(':id')
  ${config.features.includes('JWT Auth') ? "@UseGuards(JwtAuthGuard)\n  @ApiBearerAuth()" : ''}
  @ApiOperation({ summary: 'Update a ${name}' })
  update(@Param('id') id: string, @Body() data: Update${Name}Dto) {
    return this.${name}Service.update(id, data);
  }

  @Delete(':id')
  ${config.features.includes('JWT Auth') ? "@UseGuards(JwtAuthGuard)\n  @ApiBearerAuth()" : ''}
  @ApiOperation({ summary: 'Delete a ${name}' })
  remove(@Param('id') id: string) {
    return this.${name}Service.remove(id);
  }
}
      `);
    });

    // Resource-specific Frontend (Next.js)
    config.resources.forEach(res => {
      const name = res.name.toLowerCase();
      const Name = res.name;

      addFile(`frontend/src/app/${name}/page.tsx`, `
'use client';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ${Name}ListPage() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['${name}s'],
    queryFn: () => fetch(\`http://localhost:${config.apiPort}/${name}\`).then(res => res.json()),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">${Name} List</h1>
      <Table>
        <TableHeader>
          <TableRow>
            ${res.fields.map(f => `<TableHead>${f.name}</TableHead>`).join('\n            ')}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items?.map((item: any) => (
            <TableRow key={item.id}>
              ${res.fields.map(f => `<TableCell>{item.${f.name}}</TableCell>`).join('\n              ')}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
      `);
    });

    // Logging
    if (config.features.includes('Winston Logging')) {
      addFile('backend/src/common/logger.ts', `
import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json(),
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple(),
      ),
    }),
  ],
});
      `);
    }

    // Shared Types
    if (config.features.includes('Shared Types')) {
      addFile('shared/index.ts', `
export interface User {
  id: string;
  email: string;
  name?: string;
}

export type ApiResponse<T> = {
  data: T;
  message: string;
  status: number;
};
      `);
    }

    // Auth & Security
    if (config.features.includes('JWT Auth') || config.features.includes('RBAC Roles')) {
      addFile('backend/src/auth/auth.module.ts', `
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
      `);

      addFile('backend/src/auth/auth.controller.ts', `
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() req: any) {
    const user = await this.authService.validateUser(req.email, req.password);
    if (!user) return { message: 'Invalid credentials' };
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  async register(@Body() data: any) {
    return this.authService.register(data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@Request() req: any, @Body() data: any) {
    return this.authService.updateProfile(req.user.userId, data);
  }
}
      `);

      addFile('backend/src/auth/jwt.strategy.ts', `
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, roles: payload.roles };
  }
}
      `);

      addFile('backend/src/auth/jwt-auth.guard.ts', `
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
      `);

      addFile('backend/src/auth/roles.guard.ts', `
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return roles.some((role) => user.roles?.includes(role));
  }
}
      `);

      addFile('backend/src/auth/auth.service.ts', `
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(data: any) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already exists');
    
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        roles: ['user'],
      },
    });
    
    const { password, ...result } = user;
    return result;
  }

  async updateProfile(id: string, data: any) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { name: data.name },
    });
    const { password, ...result } = user;
    return result;
  }

  async verifyEmail(token: string) {
    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string) {
    return { message: 'Password reset link sent to ' + email };
  }

  async resetPassword(data: any) {
    return { message: 'Password reset successfully' };
  }
}
      `);
    }

    // Realtime
    if (config.features.includes('Socket.io') || config.features.includes('WebSockets')) {
      addFile('backend/src/events/events.module.ts', `
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
      `);

      addFile('backend/src/events/events.gateway.ts', `
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(\`Client connected: \${client.id}\`);
  }

  handleDisconnect(client: Socket) {
    console.log(\`Client disconnected: \${client.id}\`);
  }

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    return data;
  }
}
      `);
    }

    // Queues
    if (config.features.includes('BullMQ Queue')) {
      addFile('backend/src/queues/email.processor.ts', `
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    console.log(\`Processing job \${job.id} of type \${job.name}\`);
    // Email logic here
    return {};
  }
}
      `);
    }

    // GraphQL
    if (config.features.includes('GraphQL')) {
      addFile('backend/src/app.graphql', `
        type Query {
          hello: String
        }
      `);
      addFile('backend/src/graphql/graphql.module.ts', `
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
  ],
})
export class GraphqlModule {}
      `);
    }

    // Health Checks
    if (config.features.includes('Health Checks') || config.features.includes('Health Advanced')) {
      addFile('backend/src/health/health.module.ts', `
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
      `);

      addFile('backend/src/health/health.controller.ts', `
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    const dbStatus = await this.prisma.$queryRaw\`SELECT 1\`.then(() => 'up').catch(() => 'down');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      memory: process.memoryUsage(),
    };
  }
}
      `);
    }

    // API Key Auth
    if (config.features.includes('API Key Auth')) {
      addFile('backend/src/auth/api-key.guard.ts', `
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    if (apiKey !== process.env.API_KEY) {
      throw new UnauthorizedException('Invalid API Key');
    }
    return true;
  }
}
      `);
    }
    // CI/CD Pipeline
    if (config.features.includes('CI/CD Pipeline')) {
      addFile('.github/workflows/ci.yml', `
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm install
      - run: npm run build
      `);
    }

    // Frontend Components
    if (config.features.includes('Shadcn UI')) {
      addFile('frontend/src/components/ui/button.tsx', `
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
      `);

      addFile('frontend/src/components/ui/card.tsx', `
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-xl border bg-card text-card-foreground shadow", className)} {...props} />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
      `);

      addFile('frontend/src/components/ui/input.tsx', `
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
      `);

      addFile('frontend/src/lib/utils.ts', `
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
      `);
    }

    // File Upload
    if (config.features.includes('File Upload')) {
      addFile('backend/src/common/upload.controller.ts', `
import { Controller, Post, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  @Post()
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, \`\${file.fieldname}-\${uniqueSuffix}\${extname(file.originalname)}\`);
      },
    }),
  }))
  uploadFile(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
        new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf)' }),
      ],
    }),
  ) file: Express.Multer.File) {
    return {
      filename: file.filename,
      path: file.path,
      size: file.size,
    };
  }
}
      `);
    }
    // Auth Pages
    if (config.features.includes('Auth Pages')) {
      addFile('frontend/src/app/(auth)/register/page.tsx', `
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { email, password, name });
      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your details to register</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:underline">Login</a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
      `);

      addFile('frontend/src/app/(auth)/login/page.tsx', `
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.data?.access_token) {
        localStorage.setItem('token', data.data.access_token);
        toast.success('Logged in successfully');
        router.push('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="name@example.com"
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Sign In'}
            </Button>
            <p className="text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 hover:underline">Register</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
      `);
    }
  };

  const generateMobileFiles = () => {
    if (config.features.includes('React Native App') || forceMobile) {
      addFile('mobile/package.json', `
{
  "name": "mobile-app",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "ts:check": "tsc"
  },
  "dependencies": {
    "expo": "~51.0.0",
    "expo-status-bar": "~1.12.1",
    "react": "18.2.0",
    "react-native": "0.74.1",
    "react-native-safe-area-context": "4.10.1",
    "react-native-screens": "3.31.1",
    "@react-navigation/native": "^6.1.17",
    "@react-navigation/native-stack": "^6.9.26",
    "@react-navigation/bottom-tabs": "^6.5.20",
    "axios": "^1.6.8",
    "lucide-react-native": "^0.378.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "typescript": "^5.1.3"
  },
  "private": true
}
      `);

      addFile('mobile/tsconfig.json', `
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}
      `);

      addFile('mobile/app.json', `
{
  "expo": {
    "name": "${config.name}",
    "slug": "${config.name.toLowerCase().replace(/\s+/g, '-')}",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-foreground.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
      `);

      addFile('mobile/App.tsx', `
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

// Import Screens
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ResourceListScreen } from './src/screens/ResourceListScreen';
import { ResourceDetailScreen } from './src/screens/ResourceDetailScreen';

// Navigation Helpers
import { AuthProvider } from './src/api/auth-context';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#e63946',
        tabBarInactiveTintColor: '#8e8e93',
        headerStyle: { backgroundColor: '#e63946' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Database" component={ResourceListScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Detail" component={ResourceDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
      `);

      addFile('mobile/src/api/client.ts', `
import axios from 'axios';

// Connects to local dev machine (10.0.2.2 for Android emulator, localhost for iOS simulator)
const API_URL = 'http://10.0.2.2:${config.apiPort}/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = \`Bearer \${token}\`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};
      `);

      addFile('mobile/src/api/auth-context.tsx', `
import React, { createContext, useState, useContext } from 'react';
import { setAuthToken } from './client';

interface AuthContextType {
  token: string | null;
  user: any | null;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  const signIn = async (email: string, pass: string) => {
    // In actual app: post to /auth/login
    // For mockup/dev, simulate successful sign in
    setToken('mock-jwt-token');
    setUser({ email, name: 'Alex Johnson', role: 'Administrator' });
    setAuthToken('mock-jwt-token');
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
      `);

      addFile('mobile/src/screens/LoginScreen.tsx', `
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../api/auth-context';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      navigation.replace('Main');
    } catch (e: any) {
      Alert.alert('Login Failed', e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>📱</Text>
          </View>
          <Text style={styles.title}>${config.name}</Text>
          <Text style={styles.subtitle}>Mobile Enterprise Client</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="admin@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="password"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e63946',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 72,
    height: 72,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#8e8e93',
    marginBottom: 6,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1c1c1e',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#e63946',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#e63946',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
      `);

      addFile('mobile/src/screens/HomeScreen.tsx', `
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuth } from '../api/auth-context';

export function HomeScreen({ navigation }: any) {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name || 'Administrator'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 \${config.name} Mobile</Text>
          <Text style={styles.cardBody}>
            Fully generated client connecting dynamically to your NestJS REST API server. Manage database models mobile-first!
          </Text>
        </View>

        <Text style={styles.sectionTitle}>SYSTEM OVERVIEW</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>$2.4M</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#eef2ff' }]}>
            <Text style={[styles.statValue, { color: '#4f46e5' }]}>850</Text>
            <Text style={styles.statLabel}>Active Staff</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('Database')}
        >
          <Text style={styles.actionButtonText}>Go to Database Tables →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scroll: {
    padding: 20,
    gap: 20,
  },
  header: {
    marginTop: 10,
  },
  greeting: {
    fontSize: 14,
    color: '#8e8e93',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c1c1e',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 13,
    color: '#636366',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8e8e93',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    padding: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 10,
    color: '#636366',
    fontWeight: 'bold',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#e63946',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
      `);

      addFile('mobile/src/screens/SettingsScreen.tsx', `
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useAuth } from '../api/auth-context';

export function SettingsScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFILE INFO</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Email</Text>
              <Text style={styles.rowValue}>{user?.email || 'admin@example.com'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Role</Text>
              <Text style={styles.rowValue}>{user?.role || 'Administrator'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API CONFIGURATION</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Endpoint</Text>
              <Text style={[styles.rowValue, styles.mono]}>http://localhost:\${config.apiPort}/api</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Platform SDK</Text>
              <Text style={styles.rowValue}>Expo Router v51</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Styling</Text>
              <Text style={styles.rowValue}>NativeWind/Tailwind</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scroll: {
    padding: 20,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8e8e93',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  rowLabel: {
    fontSize: 13,
    color: '#636366',
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 13,
    color: '#1c1c1e',
    fontWeight: 'bold',
  },
  mono: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#e63946',
  },
});
      `);

      addFile('mobile/src/screens/ResourceListScreen.tsx', `
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';

export function ResourceListScreen({ navigation }: any) {
  const resources = \${JSON.stringify(config.resources)};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Database Models</Text>
        <Text style={styles.subtitle}>Select a table schema to manage dynamic CRUD records:</Text>

        <View style={styles.list}>
          {resources.map((res: any) => (
            <TouchableOpacity 
              key={res.name}
              style={styles.card}
              onPress={() => navigation.navigate('Detail', { resourceName: res.name })}
            >
              <View style={styles.iconBox}>
                <Text style={styles.icon}>📁</Text>
              </View>
              <View style={styles.content}>
                <Text style={styles.cardTitle}>{res.name}</Text>
                <Text style={styles.cardSubtitle}>{res.fields.length} schema fields</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scroll: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 20,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  iconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1c1c1e',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#8e8e93',
    marginTop: 2,
  },
  arrow: {
    fontSize: 16,
    color: '#c7c7cc',
    fontWeight: 'bold',
  },
});
      `);

      addFile('mobile/src/screens/ResourceDetailScreen.tsx', `
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';

export function ResourceDetailScreen({ route, navigation }: any) {
  const { resourceName } = route.params;
  const resources = \${JSON.stringify(config.resources)};
  const currentResource = resources.find((r: any) => r.name === resourceName);

  const [mockItems] = useState([
    { id: '1', label: 'Sample Record #1' },
    { id: '2', label: 'Sample Record #2' },
    { id: '3', label: 'Sample Record #3' },
  ]);

  if (!currentResource) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Resource not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to Models</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{currentResource.name} Management</Text>
          <Text style={styles.subtitle}>Dynamic CRUD records list</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.cardHeader}>SCHEMA FIELDS</Text>
          {currentResource.fields.map((f: any) => (
            <View key={f.name} style={styles.fieldInfo}>
              <Text style={styles.fieldName}>{f.name}</Text>
              <Text style={styles.fieldType}>{f.type} {f.required ? '(Required)' : ''}</Text>
            </View>
          ))}
        </View>

        <View style={styles.recordsSection}>
          <Text style={styles.sectionHeader}>DRAFT ENTRIES</Text>
          <View style={styles.recordsList}>
            {mockItems.map((item) => (
              <View key={item.id} style={styles.recordRow}>
                <View>
                  <Text style={styles.recordLabel}>{item.label}</Text>
                  <Text style={styles.recordMeta}>Dynamic values mapped successfully</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => Alert.alert('Action', 'Records operations are synced through REST API.')}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scroll: {
    padding: 20,
    gap: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#e63946',
    fontWeight: 'bold',
    fontSize: 12,
  },
  header: {
    marginTop: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1c1c1e',
  },
  subtitle: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  cardHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#8e8e93',
    letterSpacing: 1,
    marginBottom: 12,
  },
  fieldInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  fieldName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1c1c1e',
  },
  fieldType: {
    fontSize: 12,
    color: '#8e8e93',
  },
  recordsSection: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8e8e93',
    letterSpacing: 1,
  },
  recordsList: {
    gap: 10,
  },
  recordRow: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  recordLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1c1c1e',
  },
  recordMeta: {
    fontSize: 10,
    color: '#8e8e93',
    marginTop: 2,
  },
  actionBtn: {
    backgroundColor: '#eaf2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#2f80ed',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
      `);
    }
  };

  generateFeatureFiles();
  generateMobileFiles();

  return files;
};
