# share-canvas

一个基于websocket实现画板共享的全栈示例。通过创建房间进行一对多共享画板。

### 架构

1. workerman
2. vue3+typescript

### 安装

1. 后端

    ```shell
    composer install
    php start.php start
    ```

2. 前端

    ```shell
    npm install
    npm run dev
    ```

### 说明

1. 前端配置`.env.*`文件

2. 后端不需要数据库

### 截图

![](https://blog.icy8.net/2022/12/21/%E5%9F%BA%E4%BA%8Ewebsocket%E5%AE%9E%E7%8E%B0%E7%94%BB%E6%9D%BF%E5%85%B1%E4%BA%AB/GIF1.gif)

![](https://blog.icy8.net/2022/12/21/%E5%9F%BA%E4%BA%8Ewebsocket%E5%AE%9E%E7%8E%B0%E7%94%BB%E6%9D%BF%E5%85%B1%E4%BA%AB/GIF2.gif)

![](https://blog.icy8.net/2022/12/21/%E5%9F%BA%E4%BA%8Ewebsocket%E5%AE%9E%E7%8E%B0%E7%94%BB%E6%9D%BF%E5%85%B1%E4%BA%AB/GIF3.gif)