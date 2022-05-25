const canvas = document.getElementById("cw");
const ctx = canvas.getContext("2d");
const PI2 = Math.PI * 2;
const cursor = {
    x: innerWidth / 2,
    y: innerHeight / 2,
};
class Ring {
    constructor(
        innerTeeth = 105,
        outerTeeth = 150,
        rat = 0.5,
    ) {
        this.x = cursor.x;
        this.y = cursor.y;
        this.innerCirc = innerTeeth * pixPertooth;
        this.outerCirc = outerTeeth * pixPertooth;
        this.innerTeeth = innerTeeth;
        this.outerTeeth = outerTeeth;
        this.innerRad = this.innerCirc / PI2;
        this.outerRad = this.outerCirc / PI2;
        this.rat = rat;
        this.color = 'white';
        this.lw = 1;
        this.th0 = 0;
    }
    draw() {

        ctx.fillStyle = this.color;
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
        this.teeth=teeth;
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
class Pair {
    constructor(fixed, moving) {
        this.fixed = fixed;
        this.moving = moving;
        this.th = 0;
        this.auto = 0;
        this.trace = []
        this.move(this.th);
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
        this.trace.push(this.tracePoint());
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
        console.log(this.fixed)
        this.roll(PI2*calcLCM(this.fixed.innerTeeth,this.moving.teeth)/this.fixed.innerTeeth);
    }

    tracePoint() {
        let m = this.moving;
        let x = m.x + Math.cos(m.th0 + m.th) * (m.rad * m.rat)
        let y = m.y + Math.sin(m.th0 + m.th) * (m.rad * m.rat)
        return (new Point(x, y));
    }
    drawTrace() {
        ctx.beginPath();
        ctx.strokeStyle = "rgb(200,50,100)"
        ctx.moveTo(this.trace[0].x, this.trace[0].y);
        this.trace.forEach(point => {
            ctx.lineTo(point.x, point.y);
        })
        ctx.stroke();
    }

}


let date = new Date();
let dblClickCase = 0;
let mouseDown = false;
let lastTouch = date.getTime();
let thDragSt = 0;
let dthDrag = 0;
let showWheels = true;

const bgFillStyle = "rgb(50,20,30)";
const pixPertooth = 9;
const dth = PI2 / 100;
canvas.height = innerHeight;
canvas.width = innerWidth;


let disk = new Disk(37, 0.70)
let ring = new Ring(105, 130);
let pair = new Pair(ring, disk)


function anim() {
    requestAnimationFrame(anim);
    ctx.fillStyle = bgFillStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (pair.auto) {
        pair.update();
    }
    pair.drawTrace();
    if (showWheels) {
        pair.fixed.draw();
        pair.moving.draw();
    }
}

anim();



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
    mouseDown = false;
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

    if (y > canvas.height * 1 / 2) {
        dblClickCase = 0;
    }
    if (y < canvas.height * 1 / 2) {
        dblClickCase = 1;
    }
    if (y < canvas.height * 1 / 4 & x < canvas.width * 1 / 4) {
        dblClickCase = 2;
    }
    if (y < canvas.height * 1 / 4 & x > canvas.width * 3 / 4) {
        dblClickCase = 3;
    }


    if ((x - pair.moving.x) ** 2 + (y - pair.moving.y) ** 2 < pair.moving.rad ** 2) {
        mselect = true;
    }
    else {
        mselect = false;
    }
    mouseDown = true;
    thDragSt = Math.atan2(y - pair.fixed.y, x - pair.fixed.x);
}

function pointerMoveHandler(x, y) {
    if (mouseDown & mselect & !pair.auto) {
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
}

function doubleClickHandler(dblClickCase) {
    if (dblClickCase < 2) {
        pair.auto = !pair.auto
        if (dblClickCase) {
            pair.auto = -pair.auto;
        }
    }
    if (dblClickCase == 2) {
        showWheels = !showWheels;
    }
    if (dblClickCase == 3) {

        pair.fullRoll();
    }

}

function calcLCM(a, b) {
    // higher number among number1 and number2 is stored in min
    let min = (a > b) ? a : b;
    while (min<10000) {
        if (min % a == 0 && min % b == 0) {
            // console.log(`The LCM of ${num1} and ${num2} is ${min}`);
            return (min);
            // break;
        }
        min++;
    }
}


