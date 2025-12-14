# 🚀 Backend - Установка и запуск на Windows

Основной API сервер системы учета посещаемости.

---

## 📋 Требования

### 1. Node.js и npm
**Версия:** Node.js 18.x или выше

**Скачать:**
- [Node.js 18 LTS](https://nodejs.org/en/download/) (рекомендуется)
- [Node.js 20 LTS](https://nodejs.org/en/download/) (актуальная версия)

**Проверка установки:**
```powershell
node --version
npm --version
```

---

### 2. PostgreSQL (Docker)
**Для работы базы данных**

**Скачать:**
- [Docker Desktop для Windows](https://www.docker.com/products/docker-desktop/)

**После установки:**
1. Запустите Docker Desktop
2. Дождитесь полной загрузки (статус должен быть зеленым)

**Проверка установки:**
```powershell
docker --version
docker ps
```

---

## 🔧 Установка и настройка

### Шаг 1: Установка зависимостей

```powershell
cd backend
npm install
```

---

### Шаг 2: Запуск PostgreSQL

```powershell
docker run -d `
  --name attendance-postgres `
  -p 5432:5432 `
  -e POSTGRES_DB=attendance `
  -e POSTGRES_USER=attendance_user `
  -e POSTGRES_PASSWORD=secure_password_change_me `
  -v pgdata-attendance:/var/lib/postgresql/data `
  postgres:15-alpine
```

**Проверка:**
```powershell
docker ps
# Вы должны увидеть контейнер attendance-postgres
```

---

### Шаг 3: Настройка переменных окружения

Создайте файл `.env` на основе `env.example`:
```powershell
copy env.example .env
```

Откройте `.env` и укажите:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://attendance_user:secure_password_change_me@localhost:5432/attendance
JWT_ACCESS_SECRET=your-secret-access-key-change-me
JWT_REFRESH_SECRET=your-secret-refresh-key-change-me
ENCRYPTION_KEY=your-32-character-encryption-key
CORS_ORIGIN=*
CAMERA_GATEWAY_PUBLIC_URL=http://localhost:4000
CAMERA_GATEWAY_INTERNAL_URL=http://localhost:4000
PUBLIC_COMPANY_SLUG=demo-company
```

> ⚠️ **Важно:** `ENCRYPTION_KEY` должен быть 32 символа и совпадать с camera-gateway!

---

### Шаг 4: Инициализация базы данных

```powershell
npm run prisma:migrate
npm run prisma:seed
```

---

## ▶️ Запуск

### Режим разработки
```powershell
npm run dev
```

### Продакшен
```powershell
npm run build
npm start
```

Сервис доступен на: `http://localhost:3000`

---

## 🔐 Тестовые пользователи

После выполнения `npm run prisma:seed`:

**Суперадмин:**
- Email: `superadmin@system.com`
- Пароль: `SuperAdmin123!`

**Админ компании:**
- Email: `admin@demo.com`
- Пароль: `Admin123!`

---

## 🛠️ Полезные команды

### База данных
```powershell
# Применить миграции
npm run prisma:migrate

# Сбросить базу данных
npm run prisma:migrate:reset

# Заполнить тестовыми данными
npm run prisma:seed

# Открыть Prisma Studio
npm run prisma:studio
```

### Разработка
```powershell
# Запуск с hot-reload
npm run dev

# Сборка
npm run build

# Проверка типов
npm run type-check

# Линтинг
npm run lint
```

---

## 🐛 Решение проблем

### Ошибка: "Cannot connect to database"
- Убедитесь, что Docker контейнер с PostgreSQL запущен: `docker ps`
- Проверьте `DATABASE_URL` в `.env` файле
- Попробуйте перезапустить контейнер:
  ```powershell
  docker restart attendance-postgres
  ```

### Порт 3000 уже занят
```powershell
# Найти процесс на порту 3000
netstat -ano | findstr :3000

# Завершить процесс по PID
taskkill /PID <PID> /F
```

### Ошибка при миграциях Prisma
```powershell
# Сбросить базу данных и применить миграции заново
npm run prisma:migrate:reset
npm run prisma:seed
```

---

## 📚 API Документация

После запуска сервера API доступен по адресу:
- **Базовый URL:** `http://localhost:3000`
- **Health Check:** `http://localhost:3000/health`

### Основные эндпоинты:
- `POST /auth/login` - Авторизация
- `POST /auth/refresh` - Обновление токена
- `GET /users` - Список пользователей
- `GET /companies` - Список компаний
- `GET /cameras` - Список камер
- `GET /events` - События распознавания
- `GET /employees` - Сотрудники
- `GET /presence` - Данные присутствия

---

## 🏗️ Структура проекта

```
backend/
├── src/
│   ├── config.ts           # Конфигурация
│   ├── index.ts            # Точка входа
│   ├── prismaClient.ts     # Prisma клиент
│   ├── middleware/         # Middleware
│   ├── modules/            # Модули (auth, users, etc.)
│   ├── types/              # TypeScript типы
│   └── utils/              # Утилиты
├── prisma/
│   ├── schema.prisma       # Prisma схема
│   ├── migrations/         # Миграции
│   └── seed.ts            # Заполнение данными
├── .env                    # Переменные окружения
├── package.json
└── tsconfig.json
```

---

## 💡 Советы

1. **Используйте PowerShell 7** (а не Windows PowerShell 5.1) для лучшей совместимости
2. **Используйте VSCode** с расширениями:
   - ESLint
   - Prettier
   - Prisma
   - TypeScript

---

Если возникли проблемы, откройте Issue в репозитории! 🚀
