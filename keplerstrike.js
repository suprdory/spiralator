const canvas = document.getElementById("cw");
const ctx = canvas.getContext("2d");
const cursor = {
    x: innerWidth / 2,
    y: innerHeight / 2,
};
function drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color) {
    //variables to be used when creating the arrow
    var headlen = 10 * scl;
    var angle = Math.atan2(toy - fromy, tox - fromx);

    ctx.save();
    ctx.strokeStyle = color;

    //starting path of the arrow from the start square to the end square
    //and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineWidth = arrowWidth;
    ctx.stroke();

    //starting a new path from the head of the arrow to one of the sides of
    //the point
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7),
        toy - headlen * Math.sin(angle - Math.PI / 7));

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 7),
        toy - headlen * Math.sin(angle + Math.PI / 7));

    //path from the side point back to the tip of the arrow, and then
    //again to the opposite side point
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7),
        toy - headlen * Math.sin(angle - Math.PI / 7));

    //draws the paths created above
    ctx.stroke();
    ctx.restore();
}
function xtr(x) {
    return (x + xoff) * scl;
}
function ytr(y) {
    return (y + yoff) * scl;
}
class Body {
    constructor(
        x = Math.random() * canvas.width,
        y = .2 * canvas.height + Math.random() * canvas.height * 0.6,
        r = 5 + Math.random() * 50,
        m = Math.random(),
        color = generateHSLColor()) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.m = m;
        this.lw = 1;
        this.color = color;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lw;
        ctx.arc(xtr(this.x), ytr(this.y), this.r * scl, 0, 2 * Math.PI);
        ctx.stroke();
    }
}
class Planet extends Body {
    constructor(
        x = (0.5 * X) + (1.5 * X * (Math.random() - 0.5)),
        y = (0.5 * Y) + (0.5 * Y * (Math.random() - 0.5)),
        r = 5 + Math.random() * 50,
        d = Math.random() + .2,
    ) {
        let m = d * r ** 2 / 50 ** 2
        let colorString = `hsl(${50 + d * 150}, 100%, 50%)`
        super(x, y, r, m, colorString);

    }
}

function generatePlanets(n) {
    for (let i = 0; i < n; i++) {
        planetArray[i] = new Planet();
    }
}

class Base extends Body {
    constructor(n, x, y, r, color, th, sp) {
        super(x, y, r, 0, color);
        this.n = n;
        this.th = th;
        this.sp = sp;
        this.isBase = true;
        this.nhits = 0;
    }
    draw() {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lw;
        ctx.arc(xtr(this.x), ytr(this.y), this.r * scl, 0, 2 * Math.PI);
        ctx.stroke();

        // ctx.moveTo(this.x,this.y)
        drawArrow(ctx, xtr(this.x), ytr(this.y), xtr(this.x + (this.r + this.sp) * Math.cos(this.th)), ytr(this.y + (this.r + this.sp) * Math.sin(this.th)), scl * 1, this.fillColor);
    }
    launch() {
        projArray.push(new Projectile(this.x + (this.r + this.sp) * Math.cos(this.th), this.y + (this.r + this.sp) * Math.sin(this.th), this.sp * Math.cos(this.th), this.sp * Math.sin(this.th), projSize, 1, projCol[this.n], this.n))
    }
}
class Projectile extends Body {
    constructor(x = 40, y = 40, u = 0, v = 10, r = 20, m = 0, color = "#FF0000", base = 0) {
        super(x, y, r, m, color);
        this.live = true;
        this.visible = true;
        this.tracked = true;
        this.base = base;
        this.u = u;
        this.v = v;
        this.lw = 1;
        this.ud = 0;
        this.vd = 0;
        this.setAccel();
        this.t = 0
    }
    setAccel() {
        this.ud = 0;
        this.vd = 0;
        let r2 = 0;
        let atan2 = 0;
        planetArray.forEach((p) => {
            r2 = (this.x - p.x) ** 2 + (this.y - p.y) ** 2;
            atan2 = Math.atan2(this.y - p.y, this.x - p.x);
            this.ud = this.ud + p.m / r2 * Math.cos(atan2);
            this.vd = this.vd + p.m / r2 * Math.sin(atan2);
        })
        this.ud = -G * this.ud;
        this.vd = -G * this.vd;
    }

    update() {
        if (this.live) {
            this.setAccel()

            this.u = this.u + dt * this.ud;
            this.v = this.v + dt * this.vd;

            this.x = this.x + dt * this.u;
            this.y = this.y + dt * this.v;
            this.t = this.t + 1;
            if (this.t > maxAge & (Math.abs(this.x - X / 2) > maxRange || Math.abs(this.y - Y / 2) > maxRange)) {
                // this.live = false;
                // this.visible = false;
                this.tracked = false
            }
        }
    }
    draw() {
        if (this.visible) super.draw();
        // if (this.live) {
        //     drawArrow(ctx, this.x, this.y, this.x + vscl * this.u, this.y + vscl * this.v, 1, "green")
        //     drawArrow(ctx, this.x, this.y, this.x + ascl * this.ud, this.y + ascl * this.vd, 1, "red")
        // }
    }
    detectCollision(bodyArray) {
        bodyArray.forEach(b => {
            if (this.live & b != this) { // check it's live and and don't allow self collision
                if ((b.x - this.x) ** 2 + (b.y - this.y) ** 2 < (b.r + this.r) ** 2) {
                    console.log("Boom!");
                    this.live = false;
                    this.tracked = false;
                    if (b.isBase) {
                        b.nhits = b.nhits + 1
                        explosionArray.push(new Explosion(this.x, this.y, 20, 300))
                    }
                    else {
                        explosionArray.push(new Explosion(this.x, this.y, 5, 50))
                    }
                }
            }
        })
    }
}
class Ring {
    constructor(x, y, rmax) {
        this.r = 0;
        this.dr = 2;
        this.rmax = rmax
        this.x = x;
        this.y = y;
        this.hue = 60;
        this.lightness = 50;
        this.alpha = 1;
        this.live = true;
        this.dhue = 100 * this.dr / this.rmax;

    }
    update() {
        if (this.live) {
            this.r = this.r + this.dr;
            this.live = this.r < this.rmax;
            this.hue = this.hue - this.dhue;
            this.alpha = 1 - (this.r / this.rmax) ** 2;
        }
    }
    draw() {
        if (this.live) {
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${this.hue},100%,${this.lightness}%,${this.alpha})`;
            ctx.arc(xtr(this.x), ytr(this.y), this.r * scl, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }
}
class Explosion {

    constructor(x, y, n, r) {
        this.x = x;
        this.y = y;
        this.lw = 1;
        this.t = 0;
        this.n = n;
        this.r = r;
        // this.color = "#FFAA00";
        this.live = true
        this.ringArray = []
        this.ringArray.push(new Ring(x, y, r))
    }
    update() {
        if (this.live) {
            this.t++;
            this.live = this.t < this.n * this.r
            this.ringArray.forEach(ring => ring.update())

            if (this.t % 5 == 0 && this.ringArray.length < this.n) {
                this.ringArray.push(new Ring(this.x, this.y, this.r))
            }
        }
    }
    draw() {
        if (this.live) {
            this.ringArray.forEach(r => r.draw());
        }
    }
}


function generateHSLColor(hueWidth = Math.random() * 30, hueStart = 160, valueWidth = 20, valueStart = 50) {
    let colorString = 'hsl(' + (Math.random() * hueWidth + hueStart) + ' , 100%, ' + (Math.random() ** 2 * valueWidth + valueStart) + '%)'
    return colorString;
}
function setColors() {
    let hueWidth = Math.random() ** 2 * 360
    let hueStart = Math.random() * 360
    let valueStart = 50 + Math.random() ** 2 * 50
    let valueWidth = Math.random() ** 2 * 50
    planetArray.forEach((planet) => planet.setColor(
        generateHSLColor(hueWidth, hueStart, valueWidth, valueStart)))
}
function setSize() {
    X = innerWidth;
    Y = innerHeight;
    AR = Y / X;
    // set initial bounding window
    minx = 0;
    miny = 0;
    maxx = X;
    maxy = Y;

    canvas.height = Y;
    canvas.width = X;

}
addEventListener('mousedown', e => {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    mouseDown = true;
    lastTouch = new Date().getTime();

    if (e.offsetY > canvas.height / 2) {
        basex = 0;
    }
    else {
        basex = 1;
    }
    th0 = baseArray[basex].th;
    sp0 = baseArray[basex].sp;
});
addEventListener("touchstart", e => {
    e.preventDefault();
    let now = new Date().getTime();
    let timeSince = now - lastTouch;
    if (timeSince < 300) {
        //double touch
        doubleClick(basex);
    }
    lastTouch = new Date().getTime()
    cursor.x = e.touches[0].clientX;
    cursor.y = e.touches[0].clientY;
    if (cursor.y > canvas.height / 2) {
        basex = 0;
    }
    else {
        basex = 1;
    }
    mouseDown = true;
    th0 = baseArray[basex].th;
    sp0 = baseArray[basex].sp;
},
    { passive: false }
);
addEventListener('mousemove', e => {
    if (mouseDown) {
        dth = (e.offsetX - cursor.x) * dth_sens;
        baseArray[basex].th = th0 + dth;
        dsp = (e.offsetY - cursor.y) * -dsp_sens;
        baseArray[basex].sp = Math.max(0, Math.min(sp0 + dsp, maxspeed));
        redraw()
    }
});

addEventListener("touchmove", e => {
    e.preventDefault();
    dth = (e.touches[0].clientX - cursor.x) * dth_sens
    baseArray[basex].th = th0 + dth;
    dsp = (e.touches[0].clientY - cursor.y) * -dsp_sens
    baseArray[basex].sp = Math.max(0, Math.min(sp0 + dsp, maxspeed))
    redraw()
},
    { passive: false }
);
addEventListener('mouseup', e => {
    mouseDown = false;
});
addEventListener("touchend", e => {
    e.preventDefault();
    mouseDown = false;
},
    { passive: false }
);
addEventListener('dblclick', e => {
    doubleClick(basex);
});
function doubleClick(basex) {
    // console.log(basex)
    baseArray[basex].launch()
}
function redraw() {
    ctx.fillStyle = bgFillStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    planetArray.forEach((x) => x.draw())
    projArray.forEach((x) => x.draw())
    baseArray.forEach((x) => x.draw())
    explosionArray.forEach((x) => x.draw())

}
function anim() {
    requestAnimationFrame(anim);
    ctx.fillStyle = bgFillStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    explosionArray.forEach((e) => {
        e.update()
    })
    projArray.forEach((proj) => {
        proj.update()
        proj.detectCollision(planetArray)
        proj.detectCollision(baseArray)
        proj.detectCollision(projArray)
        // proj.draw()
    })

    calcScl()
    redraw()
    drawScores()
}
function drawScores() {

    ctx.font = "50px Arial";
    ctx.strokeStyle = baseCol[0]
    ctx.strokeText(baseArray[1].nhits, 10, canvas.height - 10);
    ctx.strokeStyle = baseCol[1]
    ctx.strokeText(baseArray[0].nhits, 10, 50);
}
let X, Y, AR, ARR, ARp;
let maxx, maxy, minx, miny;
let xoff, yoff = 0;
let scl = 1;
let buf = 50
function calcScl() { //calculate zoom (scl) and pan (xoff, yoff)
    // find smallest bounding window, defined by extrema of projectiles and starting window
    let xp, xpp, Xp, yp, ypp, Yp;
    let pmaxx = X;
    let pmaxy = Y;
    let pminx = 0;
    let pminy = 0;

    projArray.forEach(p => {
        if (p.tracked) {
            pmaxx = Math.max(pmaxx, p.x + buf);
            pmaxy = Math.max(pmaxy, p.y + buf);
            pminx = Math.min(pminx, p.x - buf);
            pminy = Math.min(pminy, p.y - buf);
        }
    })
    // smooth bounding window changes
    maxx = Math.max(pmaxx, maxx - (maxx - pmaxx) * zoomsmth);
    maxy = Math.max(pmaxy, maxy - (maxy - pmaxy) * zoomsmth);
    minx = Math.min(pminx, minx + (pminx - minx) * zoomsmth);
    miny = Math.min(pminy, miny + (pminy - miny) * zoomsmth);

    // adjust bounding window to fit aspect ratio
    // single p, prime, new bounding window
    xp = [minx, maxx];
    yp = [miny, maxy];
    Xp = xp[1] - xp[0];
    Yp = yp[1] - yp[0];
    ARp = Yp / Xp;
    ARR = ARp / AR;

    //p, doubple primes, window coords after aspect correction
    if (ARR < 1) { // too short, make taller
        let ax = (AR * Xp - Yp) / 2
        ypp = [yp[0] - ax, yp[1] + ax];
        xpp = xp;
    }
    else { // too narrow, make wider
        let ax = (Yp / AR - Xp) / 2
        xpp = [xp[0] - ax, xp[1] + ax];
        ypp = yp;
    }
    // set scale and offset for drawing transforms
    scl = X / (xpp[1] - xpp[0]);
    xoff = -xpp[0];
    yoff = -ypp[0];
}

let mouseDown = false;
let lastTouch = new Date().getTime();
let basex;

setSize()
const zoomsmth = 0.05;
const vscl = 2; // velocity vector scale
const ascl = 5; // acceleration vector scale
const projSize = 3;
const maxAge = 500;
const maxRange = X + Y;
let dth_sens = 0.003;
let dsp_sens = 0.15;

const projCol = ["#FF7777", "#7777FF"]
const baseCol = ["#FFBBBB", "#BBBBFF"]

const G = 100000;
const dt = 0.1;
const maxspeed = 50;


let bgFadeStyle = "rgba(0,0,0,.002)";
let bgFillStyle = "rgba(0,0,0,1)";



let projArray = [];
let baseArray = [];
let planetArray = [];
let explosionArray = [];
generatePlanets(10)
baseArray.push(new Base(0, canvas.width * 0.5, canvas.height * 0.9, 20, baseCol[0], 3 * Math.PI / 2, 20,))
baseArray.push(new Base(1, canvas.width * 0.5, canvas.height * 0.1, 20, baseCol[1], 1 * Math.PI / 2, 20,))

// explosionArray.push(new Explosion(100, 100, n=5, r=50))
// explosionArray.push(new Explosion(100, 500, n=20, r=300))
anim()