Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
}

class Disc {
    constructor(
        teeth = 84,
    ) {
        this.x = 0;
        this.y = 0;
        this.teeth = teeth;
        this.circ = teeth * pixPertooth;
        this.rad = this.circ / PI2;
        this.color = 'white';
        this.lw = baseLW * 1;
    }
    draw(xoff = X / 2, yoff = Y / 2, scl = 1) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lw;
        ctx.beginPath();
        ctx.arc((scl * this.x) + xoff, yoff + (scl * this.y), scl * this.rad, 0, PI2);
        ctx.stroke();
    }
}
class MovingDisc extends Disc {
    constructor(
        teeth = 84, rat = 0.7
    ) {
        super(teeth)
        this.rat = rat;
        this.th0 = 0;
        this.th = 0;
        this.lw = baseLW * 2;
    }
    draw(xoff = X / 2, yoff = Y / 2, scl = 1) {
        super.draw(xoff = X / 2, yoff = Y / 2, scl = 1);
        ctx.beginPath();
        ctx.moveTo((scl * this.x) + xoff, yoff + (scl * this.y));
        ctx.lineTo(
            (scl * this.x) + xoff + this.rad * Math.cos(this.th) * this.rat,
            yoff + (scl * this.y) + this.rad * Math.sin(this.th) * this.rat
        )
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(
            (scl * this.x) + xoff + this.rat * this.rad * Math.cos(this.th),
            yoff + (scl * this.y) + this.rat * this.rad * Math.sin(this.th),
            3 * baseLW, 0, PI2);
        ctx.fill();
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
        this.thickness = baseLW;
    }
    draw(ctx, xoff = X / 2, yoff = Y / 2, scl = 1) {
        if (this.points.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.thickness;
            ctx.moveTo(scl * this.points[0].x + xoff, scl * this.points[0].y + yoff);
            this.points.forEach(point => {
                ctx.lineTo(scl * point.x + xoff, scl * point.y + yoff);
            })
            ctx.stroke();
        }
    }
    bounds() {
        let xmin = 0;
        let xmax = 0;
        let ymin = 0;
        let ymax = 0;
        this.points.forEach(point => {
            xmin = Math.min(xmin, point.x);
            xmax = Math.max(xmax, point.x);
            ymin = Math.min(ymin, point.y);
            ymax = Math.max(ymax, point.y);
        })
        return ({
            xmin: xmin,
            xmax: xmax,
            ymin: ymin,
            ymax: ymax,
        })
    }
}
class Pair {
    constructor(fixed, moving) {
        this.fixed = fixed;
        this.moving = moving;
        this.out = false;
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
        ctx.fillText(Math.round(this.moving.rat * this.moving.teeth), X / 2 - txtSize, Y / 2);
    }
    drawColInfo() {
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.textAlign = "center";
        ctx.font = txtSize + 'px sans-serif';
        ctx.textBaseline = "middle";
        ctx.fillText(Math.round(this.hue), X / 2 - txtSize, Y / 2);
        ctx.fillText(Math.round(this.lightness), X / 2 + txtSize, Y / 2);
    }
    drawInfo() {
        ctx.strokeStyle = this.fixed.color;
        ctx.fillStyle = this.fixed.color;
        ctx.textAlign = "center";
        ctx.font = txtSize + 'px sans-serif';
        ctx.textBaseline = "middle";
        ctx.fillText(this.fixed.teeth, X / 2 - txtSize, Y / 2 - txtSize * 0.5);
        ctx.fillText(this.moving.teeth, X / 2 - txtSize, Y / 2 + txtSize * 0.5);
        ctx.fillText(calcLCM(this.fixed.teeth, this.moving.teeth) / this.moving.teeth, X / 2 + txtSize, Y / 2);

        ctx.beginPath();
        ctx.moveTo(X / 2 - txtSize * 2, Y / 2 - txtSize * 0.08);
        ctx.lineTo(X / 2, Y / 2 - txtSize * 0.08);
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
        let cont = this.trace.points.length > 1;
        if (cont) {
            this.traces.push(this.trace);
        }
        this.trace = new Trace(this);
        if (cont & (this.traces.length > 0)) {
            this.trace.points.push(this.traces.slice(-1)[0].points.slice(-1)[0])
        }
    }
    penDown() {
        this.tracing = true;
    }
    update() {
        this.roll(this.th + .05 / Math.max(Math.abs(1 - this.fixed.circ / this.moving.circ), .15) * this.auto);
    }
    nudge(n) {
        this.penUp()
        let thInc = -n * PI2 / this.fixed.teeth;
        if (!this.out) {
            this.moving.th0 += thInc * this.fixed.rad / this.moving.rad;
        }
        if (this.out) {
            this.moving.th0 -= thInc * this.fixed.rad / this.moving.rad;
        }
        this.move(this.th + thInc);
        this.penDown()
    }
    reset() {
        this.penUp()
        this.moving.th0 = 0;
        this.move(0);
        this.penDown()
    }
    move(th) {
        let f = this.fixed;
        let m = this.moving;
        if (this.out) {
            m.x = f.x + (f.rad + m.rad) * Math.cos(th);
            m.y = f.y + (f.rad + m.rad) * Math.sin(th);
            m.th = m.th0 + th * (f.rad / m.rad + 1)
        }
        if (!this.out) {
            m.x = f.x + (f.rad - m.rad) * Math.cos(th);
            m.y = f.y + (f.rad - m.rad) * Math.sin(th);
            m.th = m.th0 - th * (f.rad / m.rad - 1)
        }

        this.th = th;
        if (this.tracing) {
            this.trace.points.push(this.tracePoint());
        }
    }
    inOut() {
        this.penUp();
        this.out = !pair.out;
        this.moving.th0 += PI2 / 2;
        this.move(pair.th);
        this.penDown();
    }
    roll(th) {
        this.move(this.th)
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
    fullTrace() {
        this.penUp();
        this.penDown();
        this.roll(this.th + PI2 * calcLCM(this.fixed.teeth, this.moving.teeth) / this.fixed.teeth);
        this.penUp();
        this.penDown();
    }
    tracePoint() {
        let m = this.moving;
        let x = m.x + Math.cos(m.th) * (m.rad * m.rat)
        let y = m.y + Math.sin(m.th) * (m.rad * m.rat)
        return (new Point(x, y));
    }
    drawTraces(ctx, xoff = X / 2, yoff = Y / 2, scl = 1) {
        // console.log(xoff,yoff)
        this.traces.forEach(trace => {
            trace.draw(ctx, xoff, yoff, scl);
        })
        this.trace.draw(ctx, xoff, yoff, scl);
    }
    clear() {
        if (this.trace.points.length > 0) {
            this.trace = new Trace(this);
        }
        else if (this.traces.length > 0) {
            this.traces.pop();
        }
    }
    clearAll() {
        while (this.traces.length > 0 || this.trace.points.length > 0) {
            this.clear();
        }
    }
    getTracesBounds() {
        let xmin = 0;
        let xmax = 0;
        let ymin = 0;
        let ymax = 0;
        this.traces.forEach(trace => {
            // console.log(trace.bounds())
            xmin = Math.min(trace.bounds().xmin, xmin);
            xmax = Math.max(trace.bounds().xmax, xmax);
            ymin = Math.min(trace.bounds().ymin, ymin);
            ymax = Math.max(trace.bounds().ymax, ymax);
        })
        return ({
            xmin: xmin,
            xmax: xmax,
            ymin: ymin,
            ymax: ymax,
        })

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
    showUI = true;
    showWheels = true;
    let now = new Date().getTime();
    let timeSince = now - lastTouch;
    if (timeSince < 300) {
        //double touch
        doubleClickHandler(clickCase);
    }
    lastTouch = now;
    cursor.x = x;
    cursor.y = y;
    if (showShare & x > Xshare0 & x < (Xshare0 + Xshare) & y > Yshare0 & y < (Yshare0 + Yshare * 0.1)) {
        showShare = false;
    }
    else if (showShare & shareButton.contains(x, y)) {
        console.log("Share!")
        clickCase = null;
        if (timeSince > 500) {
            shareImage();
        }
    }
    else if (showShare & uploadButton.contains(x, y)) {
        clickCase = null;
        if (timeSince > 500) {
            console.log("Upload!")
            uploadImage();
        }
    }
    else if (showShare & galleryButton.contains(x, y)) {
        clickCase = null;
        if (timeSince > 500) {
            console.log("Gallery")
            window.location.href = 'gallery.html'
        }
    }

    else if (showShare & x > Xshare0 & x < (Xshare0 + Xshare) & y > Yshare0 & y < (Yshare0 + Yshare)) {
        clickCase = null;
    }
    else if (y > .5 * Y & y < (Y - uiY)) {
        clickCase = "autoCW";
    }
    else if (y > uiY & y < 0.5 * Y) {
        clickCase = "autoCCW";
    }

    else if (x < X * .25 & y < uiY * .333) {
        clickCase = "share";
    }
    else if (x < X * .25 & y > uiY * .333 & y < uiY) {
        clickCase = "hideUI";
    }
    else if (x > X * .25 & x < X * .5 & y > 0 & y < uiY * .333) {
        clickCase = "clearAll";
    }
    else if (x > X * .25 & x < X * .5 & y > uiY * 0.33 & y < uiY) {
        clickCase = "clear";
    }

    else if (x > X * .5 & x < X * .75 & y < uiY * .333) {
        clickCase = "toStart";
    }
    else if (x > X * .5 & x < X * .75 & y > uiY / 3 & y < uiY * 2 / 3) {
        clickCase = "nudgeUp";
    }
    else if (x > X * .5 & x < X * .75 & y > uiY * 2 / 3 & y < uiY * 3 / 3) {
        clickCase = "nudgeDown";
    }

    else if (x > X * .75 & y < uiY * .333) {
        clickCase = "inOut";
    }
    else if (x > X * .75 & y > uiY * .333 & y < uiY) {
        clickCase = "fullTrace";
    }

    else {
        clickCase = null;
    }


    if (y > (Y - uiY) & x < X * .25) {
        mselect = "rat";
        rat0 = pair.moving.rat;
        showRadInfo = true;
    }
    else if (y > (Y - uiY) & x > X * .25 & x < 0.5 * X) {
        mselect = "movTeeth";
        movTeeth0 = pair.moving.teeth;
        showInfo = true;
    }
    else if (y > (Y - uiY) & x > X * .5 & x < 0.75 * X) {
        mselect = "fixedTeeth";
        movTeeth0 = pair.fixed.teeth;
        showInfo = true;
    }
    else if (y > (Y - uiY) & x > X * .75 & x < 1.0 * X) {
        mselect = "color";
        pair.fixed.color = pair.color;
        pair.moving.color = pair.color;
        hue0 = pair.hue;
        lightness0 = pair.lightness;
        showColInfo = true;
    }

    else if ((x - (pair.moving.x + X / 2)) ** 2 + (y - (pair.moving.y + Y / 2)) ** 2 < pair.moving.rad ** 2) {
        mselect = "moving";
        showInfo = false;
    }
    else {
        mselect = null;
        showInfo = false;

    }
    mouseDown = true;
    thDragSt = Math.atan2(y - Y / 2, x - X / 2);
}
function pointerMoveHandler(x, y) {
    if (mouseDown & mselect == "moving" & !pair.auto) {
        dthDrag = Math.atan2(y - Y / 2, x - X / 2) - thDragSt;
        if (dthDrag < Math.PI) {
            dthDrag += PI2;
        }
        if (dthDrag > Math.PI) {
            dthDrag -= PI2;
        }
        pair.roll(pair.th + dthDrag);
        thDragSt = Math.atan2(y - Y / 2, x - X / 2);
    }
    if (mouseDown & mselect == "rat") {
        showWheelsOverride = true;
        pair.penUp();
        pair.moving.rat = Math.min(maxDrawRadiusRatio, Math.max(rat0 - (y - cursor.y) * 0.002, 0))
        pair.penDown();

    }
    if (mouseDown & mselect == "movTeeth") {
        showWheelsOverride = true;
        pair.penUp();
        pair.moving.teeth = Math.round(Math.min(maxWheelSize, Math.max(movTeeth0 - (y - cursor.y) / 10, minWheelSize)));
        if (pair.moving.teeth == pair.fixed.teeth) {
            pair.moving.teeth--;
        }
        pair.moving.circ = pair.moving.teeth * pixPertooth;
        pair.moving.rad = pair.moving.circ / PI2;
        pair.move(pair.th);
        pair.penDown();
    }

    if (mouseDown & mselect == "fixedTeeth") {
        showWheelsOverride = true;
        pair.penUp();
        pair.fixed.teeth = Math.round(Math.min(maxWheelSize, Math.max(movTeeth0 - (y - cursor.y) / 10, minWheelSize)));
        if (pair.moving.teeth == pair.fixed.teeth) {
            pair.fixed.teeth--;
        }
        pair.fixed.circ = pair.fixed.teeth * pixPertooth;
        pair.fixed.rad = pair.fixed.circ / PI2;

        pair.fixed.outerTeeth = pair.fixed.teeth + pair.fixed.thickness;
        pair.fixed.outerCirc = pair.fixed.outerTeeth * pixPertooth;
        pair.fixed.outerRad = pair.fixed.outerCirc / PI2;

        pair.move(pair.th);
        pair.penDown();
    }
    if (mouseDown & mselect == "color") {
        // showWheelsOverride = true;
        pair.move(pair.th);
        pair.penUpCont();

        pair.hue = hue0 - (y - cursor.y) / 2;
        if (pair.hue > 360) {
            pair.hue -= 360;
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
function doubleClickHandler(clickCase) {
    console.log(clickCase)
    if ((clickCase == "autoCCW" || clickCase == "autoCW") & pair.auto != 0) {
        pair.auto = 0;
    }
    else if (clickCase == "autoCCW") {
        pair.auto = -1;
    }
    else if (clickCase == "autoCW") {
        pair.auto = 1;
    }
    if (clickCase == "hideUI") {
        showUI = !showUI;
        showWheels = !showWheels;
    }
    if (clickCase == "fullTrace") {
        pair.fullTrace();
    }
    if (clickCase == "toStart") {
        pair.reset();
    }
    if (clickCase == "clear") {
        pair.clear();
    }
    if (clickCase == "clearAll") {
        pair.clearAll();
    }
    if (clickCase == "nudgeUp") {
        pair.nudge(1);
    }
    if (clickCase == "nudgeDown") {
        pair.nudge(-1);
    }
    if (clickCase == "inOut") {
        pair.inOut();
    }
    if (clickCase == "share") {
        showShare = true;
        // shareImage();
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
    ctx.font = txtSize / 4 + 'px sans-serif';
    ctx.textBaseline = "middle";
    ctx.lineWidth = baseLW;
    ctx.strokeStyle = pair.color;
    ctx.beginPath()
    ctx.moveTo(0, uiY);
    ctx.lineTo(X, uiY);
    ctx.stroke();
    ctx.beginPath()
    ctx.moveTo(0, Y - uiY);
    ctx.lineTo(X, Y - uiY);
    ctx.stroke();

    ctx.beginPath()
    ctx.moveTo(0.00 * X, uiY * .333);
    ctx.lineTo(1.00 * X, uiY * .333);
    ctx.stroke();


    ctx.beginPath()
    ctx.moveTo(0.5 * X, uiY * .666);
    ctx.lineTo(0.75 * X, uiY * .666);
    ctx.stroke();

    ctx.beginPath()
    ctx.moveTo(0.25 * X, 0);
    ctx.lineTo(0.25 * X, uiY);
    ctx.stroke();
    ctx.beginPath()
    ctx.moveTo(0.5 * X, 0);
    ctx.lineTo(0.5 * X, uiY);
    ctx.stroke();
    ctx.beginPath()
    ctx.moveTo(0.75 * X, 0);
    ctx.lineTo(0.75 * X, uiY);
    ctx.stroke();


    ctx.beginPath()
    ctx.moveTo(0.25 * X, Y);
    ctx.lineTo(0.25 * X, Y - uiY);
    ctx.stroke();
    ctx.beginPath()
    ctx.moveTo(0.5 * X, Y);
    ctx.lineTo(0.5 * X, Y - uiY);
    ctx.stroke();
    ctx.beginPath()
    ctx.moveTo(0.75 * X, Y);
    ctx.lineTo(0.75 * X, Y - uiY);
    ctx.stroke();

    ctx.fillStyle = uiTextColor;

    ctx.fillText('Share', (0.25 - 0.125) * X, uiY * .333 * .5)
    ctx.fillText('Hide', (0.25 - 0.125) * X, uiY * .333 + .666 * uiY * .5)

    ctx.fillText('Clear All', (0.50 - 0.125) * X, uiY * .333 * .5)
    ctx.fillText('Clear', (0.50 - 0.125) * X, uiY * .333 + .666 * uiY * .5)


    ctx.fillText('Reset', (0.75 - 0.125) * X, uiY * 0 + uiY / 6)
    ctx.fillText('Nudge +', (0.75 - 0.125) * X, uiY * .333 + uiY / 6)
    ctx.fillText('Nudge -', (0.75 - 0.125) * X, uiY * .666 + uiY / 6)

    ctx.fillText('Invert', (1 - 0.125) * X, uiY * 0 + uiY / 6)
    ctx.fillText('Trace', (1 - 0.125) * X, uiY * .333 + .666 * uiY * .5)

    ctx.fillText('Radius', (0.25 - 0.125) * X, Y - uiY / 2)
    ctx.fillText('Moving Disc', (0.50 - 0.125) * X, Y - uiY / 2)
    ctx.fillText('Fixed Disc', (0.75 - 0.125) * X, Y - uiY / 2)
    ctx.fillText('Colour', (1 - 0.125) * X, Y - uiY / 2)

}
function anim() {
    requestAnimationFrame(anim);
    // setScale(pair)
    ctx.fillStyle = bgFillStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (pair.auto & !showColInfo & !showInfo & !showRadInfo) {
        pair.update();
    }
    pair.drawTraces(ctx);

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
    if (showShare) {
        drawShareMenu();
    }
    if (showWait) {
        drawWait();
    }


}
function drawSquareFullImage(n = 500) {
    pair.penUp();
    let tracesBounds = pair.getTracesBounds();
    let size = (shareBorderfrac + 1) * Math.max(
        tracesBounds.xmax - tracesBounds.xmin,
        tracesBounds.ymax - tracesBounds.ymin
    )
    scl = n / size;
    let xoff = scl * (-tracesBounds.xmin + (size - (tracesBounds.xmax - tracesBounds.xmin)) / 2);
    let yoff = scl * (- tracesBounds.ymin + (size - (tracesBounds.ymax - tracesBounds.ymin)) / 2);

    console.log(size, xoff, yoff, scl);
    var canvasSh = document.createElement('canvas');
    canvasSh.width = n;
    canvasSh.height = n;
    var ctxSh = canvasSh.getContext('2d');
    ctxSh.fillStyle = bgFillStyle;
    ctxSh.fillRect(0, 0, canvasSh.width, canvasSh.height);
    pair.drawTraces(ctxSh, xoff, yoff, scl);
    return (canvasSh)
}
function shareImage() {
    if (pair.traces.length > 0) {
        showWait = true;
        canvasSq = drawSquareFullImage(1200);
        canvasSq.toBlob(function (blob) {
            const filesArray = [
                new File(
                    [blob],
                    "canvas.png",
                    {
                        type: "image/png",
                        lastModified: new Date().getTime()
                    }
                )
            ];
            const shareData = {
                files: filesArray,
            };
            navigator.share(shareData)
            showWait = false;
        })
    }
}
function uploadImage() {
    if (pair.traces.length > 0) {
        showWait = true;
        canvasSq = drawSquareFullImage(800);
        canvasSq.toBlob(function (blob) {
            imgFile = new File(
                [blob],
                "canvas.png",
                {
                    type: "image/png",
                    lastModified: new Date().getTime()
                }
            )
            let formData = new FormData();
            formData.append('name', 'JStest');
            formData.append('comment', 'JStest comment');
            formData.append('file', imgFile, "upload.png");
            console.log(formData)

            fetch(galleryAPIurl + '/upload_image', {
                method: 'POST',
                // WARNING!!!! DO NOT set Content Type!
                // headers: { 'Content-Type': 'multipart/form-data' },
                body: formData,
            }).then(response => response.json())
                .then(data => {
                    console.log(data);
                    showWait = false;
                });
        })
    }
}
// function setScale(pair) {
//     let minSpace=Math.min(X/2,(Y-2*uiY)/2);
//     let maxRad=Math.max(pair.fixed.teeth,pair.moving.teeth);
//     pixPertooth=20*minSpace/maxRad;
// }
function drawShareMenu() {
    ctx.beginPath();
    ctx.fillStyle = bgFillStyleAlpha;
    ctx.fillRect(0, 0, X, Y);

    ctx.strokeStyle = pair.color;
    ctx.rect(Xshare0, Yshare0, Xshare, Yshare);

    ctx.fillStyle = bgFillStyle;
    ctx.fillRect(Xshare0, Yshare0, Xshare, Yshare);

    ctx.strokeStyle = pair.color;
    ctx.rect(Xshare0, Yshare0, Xshare, Yshare);
    ctx.stroke();

    ctx.moveTo(Xshare0, Yshare0 + Yshare * .10);
    ctx.lineTo(Xshare0 + Xshare, Yshare0 + Yshare * .10);
    ctx.stroke();

    ctx.moveTo(Xshare0 + Xshare * 0.46, Yshare0 + Yshare * 0.025);
    ctx.lineTo(Xshare0 + Xshare * 0.54, Yshare0 + Yshare * 0.075);
    ctx.stroke();
    ctx.moveTo(Xshare0 + Xshare * 0.54, Yshare0 + Yshare * 0.025);
    ctx.lineTo(Xshare0 + Xshare * 0.46, Yshare0 + Yshare * 0.075);
    ctx.stroke();

    shareButton.draw();
    uploadButton.draw();
    galleryButton.draw();

}

class Button {
    constructor(y0, txt) {
        this.x = Xshare0 + Xshare * 0.1
        this.y = Yshare0 + Yshare * y0;
        this.h = 0.1 * Yshare;
        this.w = 0.8 * Xshare;
        this.txt = txt
    }
    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.w, this.y);
        ctx.lineTo(this.x + this.w, this.y + this.h);
        ctx.lineTo(this.x, this.y + this.h);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        ctx.fillStyle = uiTextColor;
        ctx.textAlign = "center";
        ctx.font = txtSize / 4 + 'px sans-serif';
        ctx.textBaseline = "middle";
        ctx.lineWidth = baseLW;
        ctx.fillText(this.txt, this.x + this.w / 2, this.y + this.h / 2);
    }
    contains(x, y) {
        return (x > this.x & x < (this.x + this.w) & y > this.y & y < (this.y + this.h));
    }

}

function drawWait() {

    // ctx.fillStyle = bgFillStyleAlpha;
    // ctx.fillRect(0, 0, X, Y);

    // ctx.strokeStyle = pair.color;
    // ctx.rect(Xshare0, Yshare0, Xshare, Yshare);
    ctx.beginPath();
    ctx.fillStyle = bgFillStyle;
    ctx.fillRect(Xshare0, Yshare0, Xshare, Yshare);

    ctx.strokeStyle = pair.color;
    ctx.rect(Xshare0, Yshare0, Xshare, Yshare);
    ctx.stroke();

    // ctx.moveTo(Xshare0, Yshare0 + Yshare * .10);
    // ctx.lineTo(Xshare0 + Xshare, Yshare0 + Yshare * .10);
    // ctx.stroke();

    ctx.fillStyle = uiTextColor;
    ctx.textAlign = "center";
    ctx.font = txtSize / 4 + 'px sans-serif';
    ctx.textBaseline = "middle";
    ctx.lineWidth = baseLW;
    ctx.fillText('Please wait...', Xshare0 + Xshare / 2, Yshare0 + Yshare / 2);



}

const canvas = document.getElementById("cw");
const ctx = canvas.getContext("2d");
const PI2 = Math.PI * 2;
const cursor = {
    x: innerWidth / 2,
    y: innerHeight / 2,
};

let clickCase = null;
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
let showShare = false;
let showWait = false;

const shareBorderfrac = 0.15;
const txtSize = 60 * window.devicePixelRatio;
const baseLW = 1 * window.devicePixelRatio;
let pixPertooth = 9 * window.devicePixelRatio;
const hueInit = Math.random() * 360
const bgFillStyle = "hsl(" + hueInit + ",100%,5%)";
const bgFillStyleAlpha = "hsla(" + hueInit + ",100%,5%,.80)";
const wheelColor = "white"
const uiTextColor = "white"
const maxWheelSize = 150;
const minWheelSize = 10;
const maxDrawRadiusRatio = 2;

const dth = PI2 / 100;
canvas.height = innerHeight;
canvas.width = innerWidth;
let X = canvas.width;
let Y = canvas.height;
const uiY = 0.2 * Y;
let Xshare = 200 * window.devicePixelRatio;
let Yshare = 400 * window.devicePixelRatio;
let Xshare0 = (X - Xshare) / 2;
let Yshare0 = (Y - Yshare) / 2;

shareButton = new Button(0.2, "Share Image");
uploadButton = new Button(0.5, "Upload to Gallery");
galleryButton = new Button(0.8, "View Gallery");

ringSizes = [96, 105]//,144,150]
discSizes = [24, 30, 32, 40, 42, 45, 48, 52, 56, 60, 63, 72, 75, 80, 84]

// console.log(Math.random())
let fixedDisc = new Disc(ringSizes.random())
let movingDisc = new MovingDisc(discSizes.random(), Math.random() / 2 + 0.5);
let pair = new Pair(fixedDisc, movingDisc)
// setScale(pair);

anim();