
class Ring {
    constructor(
        innerTeeth = 105,
        thickness = 15,
        rat = 0.5,
    ) {
        this.x = cursor.x;
        this.y = cursor.y;
        this.thickness = thickness
        this.innerCirc = innerTeeth * pixPertooth;
        this.outerCirc = (innerTeeth + thickness) * pixPertooth;
        this.innerTeeth = innerTeeth;
        this.outerTeeth = (innerTeeth + thickness);
        this.innerRad = this.innerCirc / PI2;
        this.outerRad = this.outerCirc / PI2;
        this.rat = rat;
        this.color = 'white';
        this.lw = 1;
        this.th0 = 0;
    }
    draw() {

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lw;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.innerRad, 0, PI2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.outerRad, 0, PI2);
        ctx.stroke();
    }
}
class Disk {
    constructor(
        teeth = 84,
        rat = 0.75,
    ) {
        this.x = cursor.x;
        this.y = cursor.y;
        this.teeth = teeth;
        this.circ = teeth * pixPertooth;
        this.rad = this.circ / PI2;
        this.color = 'white';
        this.lw = 1;
        this.rat = rat;
        this.th0 = 0;
        this.th = 0;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lw;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.rad, 0, PI2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x + this.rad * Math.cos(this.th),
            this.y + this.rad * Math.sin(this.th)
        )
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(
            this.x + this.rat * this.rad * Math.cos(this.th),
            this.y + this.rat * this.rad * Math.sin(this.th),
            3, 0, PI2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(
            this.x,
            this.y,
            3, 0, PI2);
        ctx.stroke();

    }
}
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Trace {
    constructor(pair) {
        this.points = [];
        this.color = "hsl(" + pair.hue + "," + pair.saturation + "%," + pair.lightness + "%)";
        this.thickness = 1;
    }
}
class Pair {
    constructor(fixed, moving) {
        this.fixed = fixed;
        this.moving = moving;
        this.th = 0;
        this.auto = 0;
        this.hue = hueInit;
        this.saturation = 100;
        this.lightness = 65;

        this.setColor();
        this.trace = new Trace(this);
        this.traces = [];
        this.tracing = true;
        this.move(this.th);
    }
    setColor() {
        this.color = "hsl(" + this.hue + "," + this.saturation + "%," + this.lightness + "%)"
    }

    drawRadInfo() {
        ctx.strokeStyle = this.fixed.color;
        ctx.fillStyle = this.fixed.color;
        ctx.textAlign = "center";
        ctx.font = txtSize + 'px sans-serif';
        ctx.textBaseline = "middle";
        ctx.fillText(Math.round(this.moving.rat * this.moving.teeth), this.fixed.x - txtSize, this.fixed.y);
    }
    drawColInfo() {
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.textAlign = "center";
        ctx.font = txtSize + 'px sans-serif';
        ctx.textBaseline = "middle";
        ctx.fillText(Math.round(this.hue), this.fixed.x - txtSize, this.fixed.y);
        ctx.fillText(Math.round(this.lightness), this.fixed.x + txtSize, this.fixed.y);
    }

    drawInfo() {
        ctx.strokeStyle = this.fixed.color;
        ctx.fillStyle = this.fixed.color;
        ctx.textAlign = "center";
        ctx.font = txtSize + 'px sans-serif';
        ctx.textBaseline = "middle";
        ctx.fillText(this.fixed.innerTeeth, this.fixed.x - txtSize, this.fixed.y - txtSize * 0.5);
        ctx.fillText(this.moving.teeth, this.fixed.x - txtSize, this.fixed.y + txtSize * 0.5);
        ctx.fillText(calcLCM(this.fixed.innerTeeth, this.moving.teeth) / this.moving.teeth, this.fixed.x + txtSize, this.fixed.y);

        ctx.beginPath();
        ctx.moveTo(this.fixed.x - txtSize * 2, this.fixed.y - txtSize * 0.08);
        ctx.lineTo(this.fixed.x, this.fixed.y - txtSize * 0.08);
        ctx.stroke();
    }

    penUp() {
        this.tracing = false;
        if (this.trace.points.length > 1) {
            this.traces.push(this.trace);
        }
        this.trace = new Trace(this);
    }
    penUpCont() { //for continuity between traces, start next trace with last point of previous
        this.tracing = false;
        if (this.trace.points.length > 1) {
            this.traces.push(this.trace);
            // this.traces[-1]
        }
        this.trace = new Trace(this);
        // console.log(this.traces.slice(-1)[0].points.slice(-1)[0])
        if (this.traces.length > 0) {
            this.trace.points.push(this.traces.slice(-1)[0].points.slice(-1)[0])
        }
    }


    penDown() {
        this.tracing = true;
    }
    update() {
        this.move(this.th + dth * this.auto);
    }
    move(th) {
        let f = this.fixed;
        let m = this.moving;
        m.x = f.x + (f.innerRad - m.rad) * Math.cos(th);
        m.y = f.y + (f.innerRad - m.rad) * Math.sin(th);
        m.th = m.th0 - th * (f.innerRad / m.rad - 1)
        this.th = th;
        if (this.tracing) {
            this.trace.points.push(this.tracePoint());
        }
    }
    roll(th) {
        if (Math.abs(th - this.th) < dth) {
            // normal move, increment is safely small
            this.move(th)
        }
        else {
            // move in units of dth
            let n = (th - this.th) / dth;
            // console.log(n);

            if (n > 0) {
                for (let i = 1; i < n; i++) {
                    this.move(this.th + dth);
                }
                this.move(this.th + (n - Math.floor(n)) * dth);
            }
            else {
                for (let i = 1; i < -n; i++) {
                    this.move(this.th - dth);
                }
                this.move(this.th - (Math.ceil(n) - n) * dth);
            }
        }
    }
    fullRoll() {
        // console.log(this.fixed)
        this.roll(PI2 * calcLCM(this.fixed.innerTeeth, this.moving.teeth) / this.fixed.innerTeeth);
    }
    fullTrace() {
        this.trace = new Trace(this);
        this.penUp();
        this.move(0);
        this.penDown();
        this.fullRoll();
        this.move(0);
    }
    tracePoint() {
        let m = this.moving;
        let x = m.x + Math.cos(m.th0 + m.th) * (m.rad * m.rat)
        let y = m.y + Math.sin(m.th0 + m.th) * (m.rad * m.rat)
        return (new Point(x, y));
    }
    drawTrace(trace) {
        if (trace.points.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = trace.color;
            ctx.moveTo(trace.points[0].x, trace.points[0].y);
            trace.points.forEach(point => {
                ctx.lineTo(point.x, point.y);
            })
            ctx.stroke();
        }
    }
    drawTraces() {
        this.traces.forEach(trace => {
            this.drawTrace(trace);
        })
    }
    clear() {
        // console.log("Clearing")
        // console.log('trace:', this.trace);
        // console.log('traces:', this.traces);
        if (this.trace.points.length > 0) {
            // console.log("Clear current trace")
            this.trace = new Trace(this);
        }
        else if (this.traces.length > 0) {
            // console.log("Clear last trace")
            this.traces.pop();
            // this.traces=this.traces.splice(-1);
        }
    }
}

addEventListener("mousedown", e => {
    // e.preventDefault();
    pointerDownHandler(e.offsetX, e.offsetY);
},
    // { passive: false }
);
addEventListener('mousemove', e => {
    if (mouseDown) {
        pointerMoveHandler(e.offsetX, e.offsetY)
    }
});
addEventListener('mouseup', e => {
    pointerUpHandler();
});
addEventListener("touchstart", e => {
    e.preventDefault();
    pointerDownHandler(e.touches[0].clientX, e.touches[0].clientY);
},
    { passive: false }
);
addEventListener("touchmove", e => {
    e.preventDefault();
    pointerMoveHandler(e.touches[0].clientX, e.touches[0].clientY)
},
    { passive: false }
);
addEventListener("touchend", e => {
    e.preventDefault();
    pointerUpHandler();
},
    { passive: false }
);

function pointerDownHandler(x, y) {
    let now = new Date().getTime();
    let timeSince = now - lastTouch;
    if (timeSince < 300) {
        //double touch
        doubleClickHandler(dblClickCase);
    }
    lastTouch = new Date().getTime()
    cursor.x = x;
    cursor.y = y;

    if (y > .5 * Y & y < (1 - uiY) * Y) {
        dblClickCase = "autoCW";
    }
    else if (y > uiY * Y & y < 0.5 * Y) {
        dblClickCase = "autoCCW";
    }
    else if (y < Y * uiY & x < X * .25) {
        dblClickCase = "hideUI";
    }
    else if (y < Y * uiY & x > X * .75) {
        dblClickCase = "fullTrace";
    }
    else if (y < Y * uiY & x > X * .5 & x < X * .75) {
        dblClickCase = "toStart";
    }
    else if (y < Y * uiY & x > X * .25 & x < X * .5) {
        dblClickCase = "clear";
    }
    else if (y < Y * uiY & x > X * .5 & x < X * .75) {
        dblClickCase = "color";
    }
    else {
        dblClickCase = null;
    }


    if (y > Y * (1 - uiY) & x < X * .25) {
        mselect = "rat";
        rat0 = pair.moving.rat;
        showRadInfo = true;
    }
    else if (y > Y * (1 - uiY) & x > X * .25 & x < 0.5 * X) {
        mselect = "movTeeth";
        movTeeth0 = pair.moving.teeth;
        showInfo = true;
    }
    else if (y > Y * (1 - uiY) & x > X * .5 & x < 0.75 * X) {
        mselect = "fixedTeeth";
        movTeeth0 = pair.fixed.innerTeeth;
        showInfo = true;
    }
    else if (y > Y * (1 - uiY) & x > X * .75 & x < 1.0 * X) {
        mselect = "color";
        hue0 = pair.hue;
        lightness0 = pair.lightness;
        showColInfo = true;
    }

    else if ((x - pair.moving.x) ** 2 + (y - pair.moving.y) ** 2 < pair.moving.rad ** 2) {
        mselect = "moving";
        showInfo = false;
    }
    else {
        mselect = null;
        showInfo = false;

    }
    mouseDown = true;
    thDragSt = Math.atan2(y - pair.fixed.y, x - pair.fixed.x);
}
function pointerMoveHandler(x, y) {
    if (mouseDown & mselect == "moving" & !pair.auto) {
        dthDrag = Math.atan2(y - pair.fixed.y, x - pair.fixed.x) - thDragSt;
        if (dthDrag < Math.PI) {
            dthDrag += PI2;
        }
        if (dthDrag > Math.PI) {
            dthDrag -= PI2;
        }
        pair.roll(pair.th + dthDrag);
        thDragSt = Math.atan2(y - pair.fixed.y, x - pair.fixed.x);
    }
    if (mouseDown & mselect == "rat") {
        showWheelsOverride = true;
        pair.penUp();
        pair.moving.rat = Math.min(1, Math.max(rat0 - (y - cursor.y) / 200, 0))
        pair.penDown();

    }
    if (mouseDown & mselect == "movTeeth") {
        showWheelsOverride = true;
        pair.penUp();
        pair.moving.teeth = Math.round(Math.min(pair.fixed.innerTeeth - 1, Math.max(movTeeth0 - (y - cursor.y) / 10, 10)));
        pair.moving.circ = pair.moving.teeth * pixPertooth;
        pair.moving.rad = pair.moving.circ / PI2;
        pair.move(pair.th);
        pair.penDown();
    }

    if (mouseDown & mselect == "fixedTeeth") {
        showWheelsOverride = true;
        pair.penUp();
        pair.fixed.innerTeeth = Math.round(Math.min(150, Math.max(movTeeth0 - (y - cursor.y) / 10, 50)));
        pair.fixed.innerCirc = pair.fixed.innerTeeth * pixPertooth;
        pair.fixed.innerRad = pair.fixed.innerCirc / PI2;

        pair.fixed.outerTeeth = pair.fixed.innerTeeth + pair.fixed.thickness;
        pair.fixed.outerCirc = pair.fixed.outerTeeth * pixPertooth;
        pair.fixed.outerRad = pair.fixed.outerCirc / PI2;

        pair.move(pair.th);
        pair.penDown();
    }
    if (mouseDown & mselect == "color") {
        // showWheelsOverride = true;
        pair.penUpCont();
        pair.hue = hue0 - (y - cursor.y) / 2;
        if (pair.hue > 360){
            pair.hue-=360;
        }
        if (pair.hue < 0) {
            pair.hue += 360;
        }

        pair.lightness = Math.max(00, Math.min(100, lightness0 + (x - cursor.x) / 4));
        pair.setColor();
        pair.fixed.color = pair.color;
        pair.moving.color = pair.color;
        uiColor = pair.color;
        pair.move(pair.th);
        pair.penDown();
    }

}
function pointerUpHandler() {
    mouseDown = false;
    showWheelsOverride = false;
    showInfo = false;
    showRadInfo = false;
    showColInfo = false;
    pair.fixed.color = wheelColor;
    pair.moving.color = wheelColor;

}
function doubleClickHandler(dblClickCase) {
    console.log(dblClickCase)
    if ((dblClickCase == "autoCCW" || dblClickCase == "autoCW") & pair.auto != 0) {
        pair.auto = 0;
    }
    else if (dblClickCase == "autoCCW") {
        pair.auto = -1;
    }
    else if (dblClickCase == "autoCW") {
        pair.auto = 1;
    }
    if (dblClickCase == "hideUI") {
        showUI = !showUI;
        showWheels = !showWheels;
    }
    if (dblClickCase == "fullTrace") {
        pair.fullTrace();
    }
    if (dblClickCase == "toStart") {
        pair.penUp();
        pair.move(0);
        pair.penDown();
    }
    if (dblClickCase == "clear") {
        pair.clear();
    }

}
function calcLCM(a, b) { //lowest common multiple
    let min = (a > b) ? a : b;
    while (min < 1000000) {
        if (min % a == 0 && min % b == 0) {
            return (min);
        }
        min++;
    }
}

function drawUI() {
    // ctx.strokeStyle = this.fixed.color;
    // ctx.fillStyle = this.fixed.color;
    ctx.textAlign = "center";
    ctx.font = txtSize / 2 + 'px sans-serif';
    ctx.textBaseline = "middle";

    ctx.strokeStyle = pair.color;
    ctx.beginPath()
    ctx.moveTo(0, uiY * Y);
    ctx.lineTo(X, uiY * Y);
    ctx.stroke();
    ctx.beginPath()
    ctx.moveTo(0, (1 - uiY) * Y);
    ctx.lineTo(X, (1 - uiY) * Y);
    ctx.stroke();

    ctx.beginPath()
    ctx.moveTo(0.25 * X, 0 * Y);
    ctx.lineTo(0.25 * X, uiY * Y);
    ctx.stroke();
    ctx.beginPath()
    ctx.moveTo(0.5 * X, 0 * Y);
    ctx.lineTo(0.5 * X, uiY * Y);
    ctx.stroke();
    ctx.beginPath()
    ctx.moveTo(0.75 * X, 0 * Y);
    ctx.lineTo(0.75 * X, uiY * Y);
    ctx.stroke();


    ctx.beginPath()
    ctx.moveTo(0.25 * X, Y);
    ctx.lineTo(0.25 * X, (1 - uiY) * Y);
    ctx.stroke();
    ctx.beginPath()
    ctx.moveTo(0.5 * X, Y);
    ctx.lineTo(0.5 * X, (1 - uiY) * Y);
    ctx.stroke();
    ctx.beginPath()
    ctx.moveTo(0.75 * X, Y);
    ctx.lineTo(0.75 * X, (1 - uiY) * Y);
    ctx.stroke();

    ctx.fillStyle = uiTextColor;
    ctx.fillText('Hide/Show', (0.25 - 0.125) * X, uiY * Y / 2)
    ctx.fillText('Clear', (0.50 - 0.125) * X, uiY * Y / 2)
    ctx.fillText('Reset', (0.75 - 0.125) * X, uiY * Y / 2)
    ctx.fillText('Trace', (1 - 0.125) * X, uiY * Y / 2)

    ctx.fillText('Draw Radius', (0.25 - 0.125) * X, (1 - uiY / 2) * Y)
    ctx.fillText('Inner Size', (0.50 - 0.125) * X, (1 - uiY / 2) * Y)
    ctx.fillText('Outer Size', (0.75 - 0.125) * X, (1 - uiY / 2) * Y)
    ctx.fillText('Colour', (1 - 0.125) * X, (1 - uiY / 2) * Y)

}

function anim() {
    requestAnimationFrame(anim);
    ctx.fillStyle = bgFillStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (pair.auto & !showColInfo & !showInfo & !showRadInfo) {
        pair.update();
    }

    pair.drawTraces();
    pair.drawTrace(pair.trace);
    if (showWheels | showWheelsOverride) {
        pair.fixed.draw();
        pair.moving.draw();
    }
    if (showUI) {
        drawUI();
    }
    if (showInfo) {
        pair.drawInfo();
    }
    if (showRadInfo) {
        pair.drawRadInfo();
    }
    if (showColInfo) {
        pair.drawColInfo();
    }


}

const canvas = document.getElementById("cw");
const ctx = canvas.getContext("2d");
const PI2 = Math.PI * 2;
const cursor = {
    x: innerWidth / 2,
    y: innerHeight / 2,
};
let dblClickCase = null;
let mouseDown = false;
let lastTouch = new Date().getTime();
let thDragSt = 0;
let dthDrag = 0;
let showWheels = true;
let showWheelsOverride = false;
let showUI = true;
let rat0;
let hue0;
let lightness0;
let movTeeth0;
let showInfo = false;
let showRadInfo = false;
let showColInfo = false;


const txtSize = 30;
const hueInit = Math.random() * 360
const bgFillStyle = "hsl(" + hueInit + ",100%,5%)";
const wheelColor = "white"
const uiTextColor = "white"

const pixPertooth = 9;
const dth = PI2 / 100;
canvas.height = innerHeight;
canvas.width = innerWidth;
let X = canvas.width;
let Y = canvas.height;
const uiY = 0.2;

let disk = new Disk(56, 0.70)
let ring = new Ring(105, 15);
let pair = new Pair(ring, disk)

// console.log(hueInit,bgFillStyle,pair.color)

anim();