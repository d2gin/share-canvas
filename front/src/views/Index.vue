<template>
    <div class="container">

        <div class="panel">
            <div class="panel-title">
                看他画
                <span class="btn" @click="handleDrawing">我来画</span>
            </div>
            <div class="panel-body">
                <div class="room" v-if="rooms.length <= 0">
                    没有可观看的房间
                </div>
                <div class="room" v-for="room in rooms">
                    <span class="room-name">{{room.name}}({{room.total_audience}}观众)</span>
                    <span class="btn" @click="() => handleObserve(room)">进入</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {useRouter} from "vue-router";
    import {useWebsocket} from "@/lib/WebsocketService";
    import type {Message} from "@/lib/WebsocketService";
    import config from "@/config";
    import {onMounted, ref} from "vue";
    import Http from "@/lib/Http";

    var router = useRouter();
    var webSocket = useWebsocket();
    var rooms = ref([]);
    onMounted(() => {
        loadRooms();
        webSocket.onMessage = (data: Message) => {
            let type = data.type;
            if (type === 'system-rooms-update') {
                loadRooms();
            }
        }
    });

    function loadRooms() {
        Http.post('/api', {
            "type": "system-get-rooms",
        }).then((res: any) => {
            rooms.value = res.data;
            config.rooms = res.data;
        });
    }

    function handleDrawing() {
        let roomName = prompt('输入房间名：', '梵高的画室');
        if (!roomName) {
            alert('房间名错误');
            return;
        }
        webSocket.send({
            type: "system-create-room",
            data: {name: roomName,}
        });
        config.roomName = roomName;
        router.push('/drawing');
    }

    function handleObserve(room: any) {
        config.observeRoom = room;
        router.push(`/observe?room=${room.id}`);
    }
</script>
<style lang="scss">
    body, html {
        width: 100%;
        height: 100%;
    }

    #app {
        position: relative;
        width: 100%;
        height: 100%;
    }
</style>
<style scoped lang="scss">
    .container {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;

        .viewport {
            padding: 10px;
            color: white;
            display: inline-block;
            background-color: #2ab8ea;
            margin: 5px 0;
            border-radius: 5px;
            cursor: pointer;
        }
    }

    .panel {
        border: 1px solid #e9e9e9;
        min-width: 300px;

        .panel-title {
            padding: 10px;
            background-color: #f0f0f0;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .panel-body {
            //padding: 10px;
        }
    }

    .room {
        border-bottom: 1px solid #f0f0f0;
        padding: 10px;
        font-size: 13px;

        .room-name {
            margin-right: 10px;
        }
    }

    .btn {
        display: inline-block;
        padding: 2px 10px;
        color: white;
        background-color: #2ab8ea;
        margin: 5px 0;
        border-radius: 5px;
        cursor: pointer;
    }
</style>
