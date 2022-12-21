<template>
    <div class="container">
        <div class="toobar">
            <h2>{{config.roomName}}</h2>
            <button type="button" @click="handleWipe">清空</button>
            <button type="button" @click="handleRecall">撤回</button>
            <button type="button" @click="handleRecover">恢复</button>
            <div>
                画笔颜色：<input v-model="toolbar.brushColor"/>
                画笔大小：<input v-model="toolbar.brushWidth"/>
            </div>
            <div>
                黑板背景：<input v-model="toolbar.blackboardColor"/>
                <!--黑板宽度：<input v-model="toolbar.blackboardWidth"/>-->
                <!--黑板高度：<input v-model="toolbar.blackboardHeight"/>-->
            </div>
        </div>
        <canvas id="canvas" ref="canvas"
                @mousedown="handleMouseDown"
                @mousemove="handleMouseMove"
                @mouseup="handleMouseUp"
        />
    </div>
</template>
<script setup lang="ts">
    import {ref, onMounted, reactive, watch} from 'vue';
    import {Mouse} from "@/lib/Mouse";
    import {Brush} from "@/lib/Brush";
    import {useWebsocket} from "@/lib/WebsocketService";
    import {Blackboard} from "@/lib/Blackboard";
    import config from "@/config";
    import {useRouter} from "vue-router";

    var canvas = ref();
    var mouse: Mouse;
    var brush: Brush;
    var blackboard: Blackboard;
    var webSocket = useWebsocket();
    var toolbar = reactive({
        brushColor: '',
        brushWidth: 1,
        blackboardColor: '',
        blackboardWidth: 500,
        blackboardHeight: 500,
    });
    var router = useRouter();
    onMounted(() => {
        if (!config.roomName) {
            alert('非法闯入');
            router.push('/');
        }
        var ctx = canvas.value.getContext('2d');
        blackboard = new Blackboard(ctx);
        canvas.value.height = blackboard.height;
        canvas.value.width = blackboard.width;
        brush = new Brush(ctx);
        mouse = new Mouse(brush, blackboard);
        blackboard.create();
        toolbar.brushColor = brush.color;
        toolbar.brushWidth = brush.width;
        toolbar.blackboardColor = blackboard.background;
    });
    watch(toolbar, (v, ov) => {
        brush.width = v.brushWidth;
        brush.color = v.brushColor;
        if (v.blackboardColor !== ov.blackboardColor) {
            blackboard.background = v.blackboardColor;
            handleWipe();
        }
    });

    var handleMouseDown = (e: MouseEvent) => {
        let point = {x: e.offsetX, y: e.offsetY};
        mouse.handleMouseDown(point);
        webSocket.send({
            type: 'mouse-down',
            data: {...point, toolbar},
        });
    }

    var handleMouseMove = (e: MouseEvent) => {
        if (!mouse.mouseDown) return;
        let point = {x: e.offsetX, y: e.offsetY};
        mouse.handleMouseMove(point);
        webSocket.send({
            type: 'mouse-move',
            data: {
                ...point, blackboard: {
                    path: blackboard.path,
                    movement: blackboard.movement,
                    recalledPath: blackboard.recalledPath,
                    recalledMovement: blackboard.recalledMovement,
                }
            },
        });
    }

    var handleMouseUp = (e: MouseEvent) => {
        let point = {x: e.offsetX, y: e.offsetY};
        mouse.handleMouseUp(point);
        webSocket.send({
            type: 'mouse-up',
            data: point,
        });
    }

    function handleWipe() {
        blackboard.wipe();
        webSocket.send({type: 'cmd-wipe', data: {toolbar}});
    }

    function handleRecall() {
        blackboard.recall();
        webSocket.send({type: 'cmd-recall'});
    }

    function handleRecover() {
        blackboard.recover();
        webSocket.send({type: 'cmd-recover'});
    }
</script>
<style scoped lang="scss">
    body, html {
        margin: 0;
        padding: 0;
    }

    .toobar {
        font-size: 12px;
    }
</style>
