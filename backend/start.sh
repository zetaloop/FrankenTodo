#!/bin/bash

# 检查 Java 是否安装
if ! command -v java &> /dev/null; then
    echo "错误: 未找到 Java，请先安装 JDK"
    exit 1
fi

# 检查 Maven 是否安装
if ! command -v mvn &> /dev/null; then
    echo "错误: 未找到 Maven，请先安装 Maven"
    exit 1
fi

# 检查 openGauss 是否运行
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "错误: openGauss 数据库未运行"
    exit 1
fi

# 清理并打包
echo "正在构建项目..."
mvn clean package -DskipTests

# 运行应用
echo "正在启动应用..."
java -jar target/todo-0.0.1-SNAPSHOT.jar 