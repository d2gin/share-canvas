export interface Track {
    id: string,
    brushColor: string,
    brushWidth: number,
    isBrushUp: boolean,
    x: number | 0,
    y: number | 0,
}

export class Blackboard {
    public background = '#000000';
    protected context: CanvasRenderingContext2D;
    public height: number;
    public width: number;
    public path = <any>[];
    public movement: any[] = [];
    public recalledPath: any[] = [];
    public recalledMovement: any[] = [];
    public status: string = 'free';

    constructor(context: CanvasRenderingContext2D) {
        this.context = context;
        this.width = 500;
        this.height = 500;
    }

    public create() {
        this.context!.fillStyle = this.background;
        this.context?.fillRect(0, 0, this.width, this.height);
    }

    public wipe() {
        this.context?.clearRect(0, 0, this.width, this.height);
        this.create();
        this.path = [];
        this.movement = [];
        this.recalledPath = [];
        this.recalledMovement = [];
    }

    /**
     * 绘制轨迹
     */
    public drawPath() {
        this.status = 'drawing';
        this.context?.clearRect(0, 0, this.width, this.height);
        this.create();
        if (this.path.length <= 0) return;
        this.context.beginPath();
        this.path.forEach((track: Track) => {
            this.context.strokeStyle = track.brushColor;
            this.context.lineWidth = track.brushWidth;
            if (track.isBrushUp) {
                this.context.beginPath();
            } else {
                this.context.lineTo(track.x, track.y);
                this.context.stroke();
            }
        });
        this.status = 'free';
    }

    /**
     * 撤回
     */
    public recall() {
        let id = this.movement.pop();
        if (!id) return;
        let tmp: Track[] = [];
        this.recalledMovement.unshift(id);
        this.path.forEach((track: Track) => {
            if (track.id !== id) {
                // 不需要需要撤回的轨迹
                tmp.push(track);
            } else {
                // 已撤回的轨迹
                this.recalledPath.push(track);
            }
        });
        this.path = tmp;
        this.drawPath();
    }

    /**
     * 从撤回的轨迹中恢复
     */
    public recover() {
        let id = this.recalledMovement.shift();
        if (!id) return;
        let tmp: any[] = [];
        this.movement.push(id);
        this.recalledPath.forEach((track: Track) => {
            if (id !== track.id) {
                // 没有命中的轨迹放回恢复轨迹容器中
                tmp.push(track);
            } else {
                // 命中的轨迹放到待绘制的轨迹容器中
                this.path.push(track);
            }
        });
        this.recalledPath = tmp;
        this.drawPath();
    }

    /**
     * 清空恢复栈
     */
    public resetRecover() {
        this.recalledPath = [];
        this.recalledMovement = [];
    }
}

