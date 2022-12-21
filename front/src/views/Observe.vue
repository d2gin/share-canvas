<template>
    <div class="container">
        <h2>{{config.observeRoom?.name}}</h2>
        <canvas id="canvas" ref="canvas"/>
    </div>
</template>

<script setup lang="ts">
    import {onMounted, ref} from "vue";
    import {Mouse} from "@/lib/Mouse";
    import type {Point} from "@/lib/Brush";
    import {Brush} from "@/lib/Brush";
    import type {Message} from "@/lib/WebsocketService";
    import {useWebsocket} from "@/lib/WebsocketService";
    import {Blackboard} from "@/lib/Blackboard";
    import config from "@/config";
    import {onBeforeRouteLeave, useRoute, useRouter} from "vue-router";

    var canvas = ref();
    var mouse: Mouse;
    var brush: Brush;
    var router = useRouter();
    var route = useRoute();
    var webSocket = useWebsocket();
    onMounted(() => {
        let roomId = route.query.room;
        if (!roomId) {
            alert('非法闯入');
            router.push('/');
        }
        webSocket.send({
            type: "system-subcribe-room",
            data: {id: roomId,}
        });
        if(config.rooms) {
            config.observeRoom = config.rooms[roomId];
        }
        let ctx = canvas.value.getContext('2d');
        let blackboard = new Blackboard(ctx);
        canvas.value.height = blackboard.height;
        canvas.value.width = blackboard.width;
        brush = new Brush(ctx);
        mouse = new Mouse(brush, blackboard);
        blackboard.create();
        // 广播数据
        webSocket.onMessage = (data: Message) => {
            let type = data.type;
            let point: Point = {x: data.data.x, y: data.data.y,};
            let config = data.data;
            if (type === 'mouse-down') {
                brush.color = config.toolbar.brushColor;
                brush.width = config.toolbar.brushWidth;
                mouse.handleMouseDown(point);
            } else if (type === 'mouse-move') {
                if (!mouse.mouseDown) return;
                mouse.handleMouseMove(point);
                if (blackboard.path.length !== config.blackboard.path.length) {
                    blackboard.path = config.blackboard.path;
                    blackboard.movement = config.blackboard.movement;
                    blackboard.recalledPath = config.blackboard.recalledPath;
                    blackboard.recalledMovement = config.blackboard.recalledMovement;
                    blackboard.drawPath();
                }
            } else if (type === 'mouse-up') {
                mouse.handleMouseUp(point);
            } else if (type === 'cmd-wipe') {
                blackboard.background = config.toolbar.blackboardColor;
                blackboard.wipe();
            } else if (type === 'cmd-recall') {
                blackboard.recall();
            } else if (type === 'cmd-recover') {
                blackboard.recover();
            } else if (type === 'system-room-close') {
                alert('房间已关闭');
                router.push('/');
            }
        };
    });
    onBeforeRouteLeave((to, from) => {
        webSocket.send({type: "system-unsubcribe-room",});
    });
</script>

<style scoped>

</style>
