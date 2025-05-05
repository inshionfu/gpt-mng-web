# 使用官方 Node.js LTS (Long Term Support) 版本作为基础镜像
FROM node:lts-alpine as build-stage

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json (或 yarn.lock) 到工作目录
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制项目源代码到工作目录
COPY . .

# 构建生产版本的应用
RUN npm run build

# 使用 Nginx 镜像作为最终运行环境
FROM nginx:stable-alpine as production-stage

# 复制 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 将构建好的静态文件从 build-stage 复制到 Nginx 的默认 Web 根目录
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 暴露容器的 80 端口 (Nginx 默认端口)
EXPOSE 80

# 运行 Nginx 服务器
CMD ["nginx", "-g", "daemon off;"] 