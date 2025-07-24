# Учетные записи - Тестовое задание для SaaSoft

[![Vue 3](https://img.shields.io/badge/Vue-3-41b883?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2-6e9f18?logo=vitest)](https://vitest.dev/)

## О проекте

Реализация тестового задания для SaaSoft - система управления учетными записями

[Демо](https://saasofttesktask.netlify.app) | [Техническое задание](https://docs.google.com/document/d/1sOLmhOWItVELDHl4AQ75PrzfByj5uK02uH2QMjQ0xuM/edit?tab=t.0)

## Технологический стек

- **Frontend**: Vue 3 (Composition API + `<script setup>`)
- **UI**: Tailwind CSS + shadcn
- **State management**: Pinia
- **Forms/Validation**: Zod
- **Testing**: Vitest (unit)
- **Build**: Vite
- **Deploy**: Netlify

## Установка и запуск
#### Запуск в режиме разработки: 

``
yarn или npm install
``

``
yarn dev или npm run dev
``

#### Запуск в production режиме: 

``
yarn install --production или npm install --omit=dev
``

``
yarn build или npm run build
``

#### Тестирование: 


``
yarn test:unit или npm run test:unit 
``

#### Линтинг: 


``
yarn lint или npm run lint
``

#### Форматирование: 


``
yarn format или npm run format
``

## Структура проекта
```
📦 src/
├── 📂 assets/        # Стили и изображения
├── 📂 components/        # UI-компоненты
│   ├── 📂 accounts/      # Компоненты учетных записей
│   ├── 📂 icons/         # Иконки
│   └── 📂 ui/            # Базовые UI-компоненты (Button, Input и др.)
├── 📂 config/            # Конфигурации приложения
│   └── account.config.ts # Конфиг учетных записей
├── 📂 factory/           # Фабрики объектов
│   └── account.factory.ts # Фабрика аккаунтов
├── 📂 mapper/            # Мапперы данных
│   └── account.mapper.ts # Маппер аккаунтов
├── 📂 repository/        # Репозитории данных
│   └── account.repository.ts # Работа с данными аккаунтов
├── 📂 stores/            # Хранилища Pinia
│   └── account.store.ts  # Хранилище учетных записей
├── 📂 types/             # Типы TypeScript
│   └── account.type.ts   # Типы для учетных записей
├── 📂 router/             # Навигация
├── 📂 views/             # Компоненты "страниц"
├── 📂 lib/             # доболнитеьные библиотеки
├── 📂 validation/        # Валидация
│   └── account.validation.ts # Схемы валидации
├── 📜 main.ts            # Точка входа
└── 📜 App.vue            # Корневой компонент
```

