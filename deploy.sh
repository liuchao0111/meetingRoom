#!/bin/bash

# 使用方法
# chmod +x deploy.sh
# ./deploy.sh

# 一键部署脚本
SERVER="root@39.105.27.101"
REMOTE_DIR="/root/meeting-room"

echo "📦 打包项目..."
tar --exclude='node_modules' --exclude='.git' -czvf project.tar.gz .

echo "📤 上传到服务器..."
scp project.tar.gz $SERVER:/root/

echo "🚀 部署中..."
ssh $SERVER "cd $REMOTE_DIR && rm -rf * && tar -xzvf ../project.tar.gz && docker compose down && docker compose up -d --build"

echo "✅ 部署完成!"
echo "访问: https://leachliu.cn"
echo "管理后台: https://admin.leachliu.cn"
