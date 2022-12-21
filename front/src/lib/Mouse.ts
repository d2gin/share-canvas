import type {Brush, Point} from "@/lib/Brush";
import type {Blackboard, Track} from "@/lib/Blackboard";

export class Mouse {
    protected onceMovementKey: string | undefined;
    public mouseDown = false;
    public mouseUp = false;
    public start = {x: 0, y: 0,};
    public end = {x: 0, y: 0,};
    protected brush: Brush;
    protected blackboard: Blackboard;

    constructor(brush: Brush, blackboard: Blackboard) {
        this.brush = brush;
        this.blackboard = blackboard;
    }

    public handleMouseDown(point: Point) {
        this.onceMovementKey = (new Date()).getTime() + Math.floor(Math.random() * 10) + '';
        this.mouseDown = true;
        this.start = point;
        this.end = {x: 0, y: 0,};
        this.brush.begin(point);
        this.blackboard.movement.push(this.onceMovementKey);
        this.blackboard.resetRecover();
        this.blackboard.path.push(<Track>{
            id: this.onceMovementKey,
            brushColor: this.brush.color,
            brushWidth: this.brush.width,
            isBrushUp: false,
            ...point,
        });
    }

    public handleMouseMove(point: Point) {
        if (!this.mouseDown) return;
        this.brush.drawLine(point);
        this.blackboard.path.push(<Track>{
            id: this.onceMovementKey,
            brushColor: this.brush.color,
            brushWidth: this.brush.width,
            isBrushUp: false,
            ...point,
        });
    }

    public handleMouseUp(point: Point) {
        this.mouseDown = false;
        this.end = point;
        this.blackboard.path.push(<Track>{
            id: this.onceMovementKey,
            brushColor: this.brush.color,
            brushWidth: this.brush.width,
            isBrushUp: true,// 抬起画笔
            ...point,
        });
    }
}
