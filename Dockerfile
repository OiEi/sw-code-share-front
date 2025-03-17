
FROM node:18-alpine as build

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build

# Этап 2: настройка nginx для раздачи статических файлов
FROM nginx:alpine

# Копируем собранные файлы из предыдущего этапа
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем нашу nginx конфигурацию
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
