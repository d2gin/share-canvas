export interface Point {
    x: number,
    y: number,
}

export class Brush {
    get context(): CanvasRenderingContext2D {
        return this._context;
    }

    private _context: CanvasRenderingContext2D;
    public color = '#ffffff';
    public width = 1;

    constructor(context: CanvasRenderingContext2D) {
        this._context = context;
    }

    public begin(point: Point) {
        this._context.beginPath();
        this._context.moveTo(point.x, point.y);
    }

    public drawLine(point: Point) {
        this._context.strokeStyle = this.color;
        this._context.lineWidth = this.width;
        this._context.lineTo(point.x, point.y);
        this._context.stroke();
    }
}

