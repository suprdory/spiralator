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
        rat=0.5,
    ) {
        this.x = cursor.x;
        this.y = cursor.y;
        this.innerCirc = innerTeeth * pixPertooth;
        this.outerCirc = outerTeeth * pixPertooth;
        this.innerRad = this.innerCirc / PI2;
        this.outerRad = this.outerCirc / PI2;
        this.rat=rat;
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
        rat=0.75,

    ) {
        this.x = cursor.x;
        this.y = cursor.y;
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
            this.x ,
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
        this.move(this.th);
    }
    update() {
        this.move(this.th + dth);
    }
    move(th) {
        let f = this.fixed;
        let m = this.moving;
        m.x = f.x + (f.innerRad - m.rad) * Math.cos(th);
        m.y = f.y + (f.innerRad - m.rad) * Math.sin(th);
        m.th = m.th0 - th * (f.innerRad / m.rad - 1)
        this.th = th;
    }
    tracePoint() {
        let m = this.moving;
        let x = m.x + Math.cos(m.th0 + m.th) * (m.rad * m.rat)
        let y = m.y + Math.sin(m.th0 + m.th) * (m.rad * m.rat)
        return (new Point(x, y));
    }

}
function makeArr(startValue, stopValue, cardinality) {
    var arr = [];
    var step = (stopValue - startValue) / (cardinality - 1);
    for (var i = 0; i < cardinality; i++) {
        arr.push(startValue + (step * i));
    }
    return arr;
}

function plotTrace(trace) {
    ctx.beginPath();
    ctx.strokeStyle="rgb(200,50,100)"
    ctx.moveTo(trace[0].x, trace[0].y);
    trace.forEach(point => {
        ctx.lineTo(point.x, point.y);
    })
    ctx.stroke();
}

const pixPertooth = 9;
const dth = PI2 / 100;
canvas.height = innerHeight;
canvas.width = innerWidth;

let disk = new Disk(72,0.75)
let ring = new Ring(105,130);
let pair = new Pair(ring, disk)
pointArray = [];

function anim() {
    requestAnimationFrame(anim);
    ctx.fillStyle = "rgb(50,20,30)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pointArray.push(pair.tracePoint());
    plotTrace(pointArray);
    pair.update();
    pair.fixed.draw();
    pair.moving.draw();


}

anim();




