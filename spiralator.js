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
        super.draw(xoff, yoff, scl);
        ctx.beginPath();
        ctx.moveTo((scl * this.x) + xoff, yoff + (scl * this.y));
        ctx.lineTo(
            (scl * this.x) + xoff + scl * this.rad * Math.cos(this.th) * this.rat,
            yoff + (scl * this.y) + scl * this.rad * Math.sin(this.th) * this.rat
        )
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(
            (scl * this.x) + xoff + scl * this.rat * this.rad * Math.cos(this.th),
            yoff + (scl * this.y) + scl * this.rat * this.rad * Math.sin(this.th),
            3 * baseLW, 0, PI2);
        ctx.fill();
    }
    setRat(r) {
        this.rat = r;
    }
    getRat() {
        return (this.rat);
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
        // this.thickness = baseLW;
    }
    draw(ctx, xoff = X / 2, yoff = Y / 2, scl = 1) {
        if (this.points.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = baseLW * 1;
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
        ctx.fillText(Math.round(this.lightness - 50), X / 2 + txtSize, Y / 2);
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
                for (let i = 1; i < (n); i++) {
                    this.move(this.th + dth);
                }
                this.move(this.th + (n - Math.floor(n)) * dth);
            }
            else {
                for (let i = 1; i < -(n); i++) {
                    this.move(this.th - dth);
                }
                this.move(this.th - (Math.ceil(n) - n) * dth);
            }
        }
    }
    fullTrace() {
        this.penUp();
        this.penDown();
        let startTh = this.th;
        this.roll(this.th + PI2 * calcLCM(this.fixed.teeth, this.moving.teeth) / this.fixed.teeth);
        this.move(startTh + PI2 * calcLCM(this.fixed.teeth, this.moving.teeth) / this.fixed.teeth)
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

function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
}
function addPointerListeners() {
    if (isTouchDevice()) {
        canvas.addEventListener("touchstart", e => {
            e.preventDefault();
            // This event is cached to support 2-finger gestures
            console.log("pointerDown", e);
            pointerDownHandler(e.touches[0].clientX, e.touches[0].clientY, e.touches.length);

        },
            { passive: false }
        );
        canvas.addEventListener("touchmove", e => {
            e.preventDefault();


            if (e.touches.length == 1) {
                pointerMoveHandler(e.touches[0].clientX, e.touches[0].clientY)
            }
            // If two pointers are down, check for pinch gestures
            if (e.touches.length == 2) {
                curDiff = Math.abs(e.touches[0].clientX - e.touches[1].clientX) +
                    Math.abs(e.touches[0].clientY - e.touches[1].clientY);
                if (prevDiff > 0) {
                    dDiff = curDiff - prevDiff;
                    zoomHandler(
                        0.0025 * dDiff,
                        (e.touches[0].clientX + e.touches[1].clientX)/2,
                        (e.touches[0].clientY + e.touches[1].clientY)/2)
                    scl = Math.min(Math.max(scl * (1 + 0.0025 * dDiff), 0.05), 10);
                }
                prevDiff = curDiff;
            }


        },
            { passive: false }
        );
        canvas.addEventListener("touchend", e => {
            e.preventDefault();
            prevDiff = -1;
            pointerUpHandler(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        },
            { passive: false }
        );
    }
    else {
        addEventListener("mousedown", e => {
            // e.preventDefault();
            // pointerDownHandler(e.offsetX, e.offsetY);
            pointerDownHandler(e.clientX, e.clientY)
        },
            // { passive: false }
        );
        addEventListener('mousemove', e => {
            if (mouseDown) {
                pointerMoveHandler(e.clientX, e.clientY)
            }
        });
        addEventListener('mouseup', e => {
            pointerUpHandler(e.clientX, e.clientY);
        });
        addEventListener('wheel', e => {
            // console.log(e)
            zoomHandler(e.deltaY,e.clientX,e.clientY);
        })
    }
}
function zoomHandler(dW,x,y) {

    xt = (x - xOff) / scl
    yt = (y - yOff) / scl

    // console.log(
    //     'x',x,
    //     'xt',xt,
    //     'y',y,
    //     'yt',yt,  
    // )
    zFrac=(0.0005 * -dW)
    scl = Math.min(10, Math.max(scl *(1+zFrac), 0.05));
    xOff=x-xt*scl
    yOff=y-yt*scl
    // console.log(xOff)

}
function pointerDownHandler(x, y, n = 1) {

    if (!showgalleryForm) {
        panelArray.forEach(panel => panel.pointerDown(x, y))
        // showWheels = true;

        let now = new Date().getTime();
        let timeSince = now - lastTouch;
        if (timeSince < 300 & n < 2) {
            //double touch
            doubleClickHandler(clickCase);
        }
        lastTouch = now;
        cursor.x = x;
        cursor.y = y;


        if (((y > .5 * Y & y < (Y - uiY)) & !isLandscape) ||
            ((y > .5 * Y & y < Y & x > uiX) & isLandscape)) {
            clickCase = "autoCW";
        }

        else if (((y < .5 * Y & y > (uiY)) & !isLandscape) ||
            ((y < .5 * Y & y > 0 & x > uiX) & isLandscape)) {
            clickCase = "autoCCW";
        }
        else {
            clickCase = null;
        }
    }

    xt = (x - xOff) / scl
    yt = (y - yOff) / scl
    // console.log(xt, yt, pair.moving.x, pair.moving.y)
    if ((xt - (pair.moving.x)) ** 2 + (yt - (pair.moving.y)) ** 2 < (pair.moving.rad) ** 2) {
        mselect = "moving";
        // showInfo = false;
    }
    else if (y < (Y - uiY) & y > uiY) {
        mselect = "pan";
        y0 = y;
        x0 = x;
        xOff0 = xOff;
        yOff0 = yOff;
        // console.log("Pan")
    }
    else {
        mselect = null;
        // showInfo = false;

    }
    mouseDown = true;
    thDragSt = Math.atan2(yt - pair.fixed.y, xt - pair.fixed.x);
}
function pointerMoveHandler(x, y) {
    xt = (x - xOff) / scl
    yt = (y - yOff) / scl
    panelArray.forEach(panel => panel.pointerMove(x, y));
    if (mselect == "moving" & !pair.auto) {
        dthDrag = Math.atan2(yt - pair.fixed.y, xt - pair.fixed.x) - thDragSt;
        if (dthDrag < Math.PI) {
            dthDrag += PI2;
        }
        if (dthDrag > Math.PI) {
            dthDrag -= PI2;
        }
        pair.roll(pair.th + dthDrag);
        thDragSt = Math.atan2(yt - pair.fixed.y, xt - pair.fixed.x);
    }
    if (mselect == "pan") {
        xOff = xOff0 + (x - x0);
        yOff = yOff0 + (y - y0);
        // console.log('xOff',xOff,'x',x,'x0',x0)

    }


}
function pointerUpHandler(x, y) {
    mouseDown = false;
    showWheelsOverride = false;
    pair.fixed.color = wheelColor;
    pair.moving.color = wheelColor;
    mselect = null;

    panelArray.forEach(panel => panel.pointerUp(x, y))
}
function doubleClickHandler(clickCase) {
    if (showWheels) {
        if ((clickCase == "autoCCW" || clickCase == "autoCW") & pair.auto != 0) {
            pair.auto = 0;
        }
        else if (clickCase == "autoCCW") {
            pair.auto = -1;
        }
        else if (clickCase == "autoCW") {
            pair.auto = 1;
        }
    }

    console.log(clickCase)
    topPanel.active = true;
    bottomPanel.active = true;
    showWheels = true;
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
function drawSquareFullImage(n = 500) {
    pair.penUp();
    let baseLWtemp = baseLW;
    baseLW = galleryLW * n / 1080;
    let tracesBounds = pair.getTracesBounds();
    let size = (shareBorderfrac + 1) * Math.max(
        tracesBounds.xmax - tracesBounds.xmin,
        tracesBounds.ymax - tracesBounds.ymin
    )
    let imscl = n / size;
    let xoff = imscl * (-tracesBounds.xmin + (size - (tracesBounds.xmax - tracesBounds.xmin)) / 2);
    let yoff = imscl * (- tracesBounds.ymin + (size - (tracesBounds.ymax - tracesBounds.ymin)) / 2);

    console.log(size, xoff, yoff, imscl);
    var canvasSh = document.createElement('canvas');
    canvasSh.width = n;
    canvasSh.height = n;
    var ctxSh = canvasSh.getContext('2d');
    ctxSh.fillStyle = bgFillStyle;
    ctxSh.fillRect(0, 0, canvasSh.width, canvasSh.height);
    pair.drawTraces(ctxSh, xoff, yoff, imscl);
    baseLW = baseLWtemp;
    return (canvasSh)
}
function shareImage() {
    if (pair.traces.length > 0) {
        sharePanel.wait = true;
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
            sharePanel.wait = false;
        })
    }
}
function uploadImage(name, comment) {
    if (pair.traces.length > 0) {
        sharePanel.wait = true;
        canvasSq = drawSquareFullImage(gallerySize);
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
            formData.append('name', name);
            formData.append('comment', comment);
            formData.append('file', imgFile, "upload.png");
            console.log(formData)

            fetch(galleryAPIurl + '/upload_image', {
                method: 'POST',
                // WARNING!!!! DO NOT set Content Type!
                // headers: { 'Content-Type': 'multipart/form-data' },
                body: formData,
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    sharePanel.wait = false;
                })
                .catch((error) => {
                    console.error('Error:', error);
                    sharePanel.wait = false;
                });
        })
    }
}
class PButton {
    constructor(panel, x, y, w, h, txt, fun, argObj, getXdragVar, getYdragVar, isDepressedFun) {
        this.x = panel.x + x * panel.w;
        this.y = panel.y + y * panel.h;
        this.w = w * panel.w;
        this.h = h * panel.h;
        this.txt = txt;
        this.fun = fun;
        this.argObj = argObj;
        this.depressed = false;
        this.xDrag = false;
        this.yDrag = false;
        this.y0;
        this.x0;
        this.xVar0;
        this.yVar0;
        this.getYdragVar = getYdragVar;
        this.getXdragVar = getXdragVar;
        this.isDepressedFun = isDepressedFun;
    }
    draw() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.w, this.h);
        ctx.stroke();

        if (this.depressed) {
            ctx.fillStyle = pair.color;
            ctx.fillRect(this.x, this.y, this.w, this.h)
        }

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
    action() {
        this.fun(this.argObj);
    }
    pointerDown(x, y) {
        if (this.contains(x, y)) {
            this.depressed = true;
            this.x0 = x;
            this.y0 = y;
            if (this.yDrag) {
                this.yVar0 = this.getYdragVar();
                this.isDepressedFun(true);
            }
            if (this.xDrag) {
                this.xVar0 = this.getXdragVar();
                this.isDepressedFun(true);
            }
        }
    }
    pointerUp(x, y) {
        if (!this.xDrag & !this.yDrag & this.depressed & this.contains(x, y)) {
            this.action();
        }
        this.depressed = false;
        if (this.isDepressedFun) {
            this.isDepressedFun(false);
        }
    }
    pointerMove(x, y) {
        if (!this.contains(x, y) & !this.yDrag & !this.xDrag) {
            this.depressed = false;
        }
        if (this.xDrag & this.yDrag & this.depressed) {
            this.fun(y - this.y0, this.yVar0, x - this.x0, this.xVar0);
        }
        else if (this.yDrag & this.depressed) {
            this.fun(y - this.y0, this.yVar0);
        }
        else if (this.xDrag & this.depressed) {
            this.fun(x - this.x0, this.xVar0);
        }
    }
}
class Panel {
    constructor(x, y, w, h) {
        this.active = true;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.anyClickActivates = false;
        this.overlay = false;
        this.buttonArray = [];
        this.wait = false;
    }
    draw() {
        if (this.active) {
            if (this.overlay) {
                ctx.beginPath();
                ctx.lineWidth = baseLW * 1;
                ctx.fillStyle = bgFillStyleAlpha;
                ctx.fillRect(0, 0, X, Y);
                ctx.fillStyle = bgFillStyle;
                ctx.fillRect(this.x, this.y, this.w, this.h)
            }
            ctx.fillStyle = bgFillStyleAlpha;
            ctx.fillRect(this.x, this.y, this.w, this.h);

            ctx.beginPath();
            ctx.strokeStyle = pair.color;
            ctx.lineWidth = baseLW * 2;
            ctx.rect(this.x, this.y, this.w, this.h)
            ctx.stroke();
            ctx.lineWidth = baseLW * 1;
            if (!this.wait) {
                this.buttonArray.forEach(button => button.draw());
            }
            else {
                ctx.fillStyle = uiTextColor;
                ctx.fillText('Please wait...', this.x + this.w / 2, this.y + this.h / 2);
            }
        }
    }
    pointerDown(x, y) {
        if (this.active) {
            this.buttonArray.forEach(button => button.pointerDown(x, y))
        }
        // if (this.anyClickActivates) {
        //     this.active = true;
        // }
    }
    pointerUp(x, y) {
        if (this.active) {
            this.buttonArray.forEach(button => button.pointerUp(x, y))
        }
    }
    pointerMove(x, y) {
        if (this.active) {
            this.buttonArray.forEach(button => button.pointerMove(x, y))
        }
    }

}
function createSharePanel() {
    let panel = new Panel((X - 200) / 2, (Y - 400) / 2, 200, 400);
    panel.overlay = true;
    // panel.wait=true;
    panel.active = false;
    panel.buttonArray.push(
        new PButton(panel, 0.0, 0, 1, 0.1, "Close",
            function () { panel.active = false; })
    );
    panel.buttonArray.push(
        new PButton(panel, 0.1, .2, .8, 0.1, "Share Image",
            function () { shareImage(); })
    );
    panel.buttonArray.push(
        new PButton(panel, 0.1, .5, .8, 0.1, "Upload to Gallery",
            function () { toggleGalleryForm() })
    );
    panel.buttonArray.push(
        new PButton(panel, 0.1, .8, .8, 0.1, "View Gallery",
            function () { window.location.href = 'gallery.html' })
    );

    return (panel);

}
function createTopPanel() {




    let uiBorder = X / 100;
    let panel = new Panel(0 + uiBorder, 0 + uiBorder, uiX - 2 * uiBorder, uiY);
    panel.anyClickActivates = true;

    panel.buttonArray.push(
        new PButton(panel, 0.0, 0.0, 0.25, 0.333, "Share",
            function () { sharePanel.active = true; })
    );
    panel.buttonArray.push(
        new PButton(panel, 0.0, 0.333, 0.25, 0.666, "Hide",
            function () {
                // showUI = false;
                showWheels = false;
                panelArray.forEach(panel => panel.active = false)
            })
    );

    panel.buttonArray.push(
        new PButton(panel, 0.25, .0, 0.25, 0.333, "Clear All",
            function () { pair.clearAll() })
    );
    panel.buttonArray.push(
        new PButton(panel, 0.25, .333, 0.25, 0.666, "Clear",
            function () { pair.clear(); })
    );



    panel.buttonArray.push(
        new PButton(panel, 0.5, 0, 0.25, 0.333, "Reset",
            function () { return pair.reset(); })
    );
    panel.buttonArray.push(
        new PButton(panel, 0.5, .333, 0.25, 0.333, "Nudge +",
            function () { return pair.nudge(1); })
    );
    panel.buttonArray.push(
        new PButton(panel, 0.5, .666, 0.25, 0.333, "Nudge -",
            function () { return pair.nudge(-1); })
    );

    panel.buttonArray.push(
        new PButton(panel, 0.75, 0, 0.25, 0.333, "Invert",
            function () { pair.inOut(); })
    );
    panel.buttonArray.push(
        new PButton(panel, 0.75, .333, 0.25, 0.666, "Trace",
            function () { pair.fullTrace() })
    );

    return (panel)
}
function createBottomPanel() {

    let uiBorder = X / 100;
    let panel = new Panel(0 + uiBorder, Y - uiY - 2 * uiBorder + uiBorder, uiX - 2 * uiBorder, uiY);
    panel.anyClickActivates = true;

    let ratButton = new PButton(panel, 0.0, 0, 0.25, 1, "Radius",
        function (dy, yDragVar0) {
            showWheelsOverride = true;
            pair.penUp();
            pair.moving.rat = Math.min(maxDrawRadiusRatio, Math.max(-0.001 * dy + yDragVar0, 0))
            pair.penDown();

        }, [], [],
        function () {
            return pair.moving.rat;
        },
        function (isDepressed) {
            showRadInfo = isDepressed;
        },
    )
    ratButton.yDrag = true;
    panel.buttonArray.push(ratButton)

    let movRadButton = new PButton(panel, 0.25, 0, 0.25, 1, "Moving Disc",
        function (dy, yDragVar0) {

            showWheelsOverride = true;
            pair.penUp();
            pair.moving.teeth = Math.round(Math.min(maxWheelSize, Math.max(-0.1 * dy + yDragVar0, minWheelSize)));
            if (pair.moving.teeth == pair.fixed.teeth) {
                pair.moving.teeth--;
            }
            pair.moving.circ = pair.moving.teeth * pixPertooth;
            pair.moving.rad = pair.moving.circ / PI2
            pair.move(pair.th);
            pair.penDown();
        }, [], [],
        function () {
            return pair.moving.teeth;
        },
        function (isDepressed) {
            showInfo = isDepressed;
        }
    )
    movRadButton.yDrag = true;
    panel.buttonArray.push(movRadButton)

    let fixRadButton = new PButton(panel, 0.50, 0, 0.25, 1, "Fixed Disc",
        function (dy, yDragVar0) {
            showWheelsOverride = true;
            pair.penUp();
            pair.fixed.teeth = Math.round(Math.min(maxWheelSize, Math.max(-0.1 * dy + yDragVar0, minWheelSize)));
            if (pair.fixed.teeth == pair.moving.teeth) {
                pair.fixed.teeth--;
            }
            pair.fixed.circ = pair.fixed.teeth * pixPertooth;
            pair.fixed.rad = pair.fixed.circ / PI2
            pair.move(pair.th);
            pair.penDown();
        }, [], [],
        function () {
            return pair.fixed.teeth;
        },
        function (isDepressed) {
            showInfo = isDepressed;
        }
    )
    fixRadButton.yDrag = true;
    panel.buttonArray.push(fixRadButton)

    let colButton = new PButton(panel, 0.75, 0, 0.25, 1, "Colour",
        function (dy, yDragVar0, dx, xdragVar0) {

            pair.move(pair.th);
            pair.penUpCont();

            pair.hue = yDragVar0 - 0.5 * dy;
            if (pair.hue > 360) {
                pair.hue -= 360;
            }
            if (pair.hue < 0) {
                pair.hue += 360;
            }
            // console.log(dy, yDragVar0, dx, xdragVar0)
            pair.lightness = Math.max(00, Math.min(100, xdragVar0 + dx * 0.25));

            pair.setColor();
            pair.fixed.color = pair.color;
            pair.moving.color = pair.color;
            document.querySelector(':root').style.setProperty('--fgColor', pair.color)
            pair.move(pair.th);
            pair.penDown();

        }, [], function () {
            return pair.lightness;
        },
        function () {
            return pair.hue;
        },
        function (isDepressed) {
            showColInfo = isDepressed;
        }
    )
    colButton.yDrag = true;
    colButton.xDrag = true;
    panel.buttonArray.push(colButton)

    return panel;
}

function submitToGallery() {
    let name = document.getElementById('name').value;
    localStorage.setItem('name', name);
    let comment = document.getElementById('comment').value;
    console.log("Subbed", name, comment);
    toggleGalleryForm();
    uploadImage(name, comment);
}
function toggleGalleryForm() {
    form = document.getElementById("galleryForm").style;
    // console.log(form.visibility)
    if (!(form.visibility == "visible")) {
        form.visibility = "visible"
        showgalleryForm = true;
    }
    else {
        form.visibility = "hidden"
        showgalleryForm = false;
    }
}
function anim() {
    requestAnimationFrame(anim);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scl, 0, 0, scl, xOff, yOff)
    if (pair.auto & !showColInfo & !showInfo & !showRadInfo) {
        pair.update();
    }
    pair.drawTraces(ctx, 0, 0, 1);

    if (showWheels | showWheelsOverride) {
        pair.fixed.draw(0, 0, 1)
        pair.moving.draw(0, 0, 1);
    }
    ctx.setTransform(scl0, 0, 0, scl0, 0, 0)
    panelArray.forEach(panel => panel.draw())

    if (showInfo) {
        pair.drawInfo();
    }
    if (showRadInfo) {
        pair.drawRadInfo();
    }
    if (showColInfo) {
        pair.drawColInfo();
    }


    // ctx.fillText(Math.round(prevDiff), 20, uiY + 50)
    // ctx.fillText(Math.round(curDiff), 20, uiY + 80)
    // ctx.fillText(Math.round(dDiff), 20, uiY + 110)
    // ctx.fillText(Math.round(scl * 10000) / 10000, 20, uiY + 140)
    // ctx.fillText('v12', 20, Y - 15)

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
let showWheels = true;
let showWheelsOverride = false;
let showInfo = false;
let showRadInfo = false;
let showColInfo = false;
let showgalleryForm = false;

// canvas.height = window.innerHeight * window.devicePixelRatio;
// canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
// let scl0 = 1 / window.devicePixelRatio;
let scl0 = 1
let X = canvas.width;
let Y = canvas.height;

// let pixRat = window.devicePixelRatio * 1.0;
let pixRat = 1.0;
if (window.orientation == 90 || window.orientation == 270) {
    //dodgy fix for "incorrect" window size reported in landscape, 
    //meaning pixel ratio is inappropriate scaling measure
    //only reported on modile device so no problem on desktop
    pixRat = pixRat * (Y / X)
}
const txtSize = 60 * pixRat;
let baseLW = 1 * pixRat;
let pixPertooth = 9 * pixRat;

const shareBorderfrac = 0.15;
const hueInit = Math.random() * 360
const bgFillStyle = "hsl(" + hueInit + ",100%,5%)";
const bgFillStyleAlpha = "hsla(" + hueInit + ",100%,5%,.80)";
const wheelColor = "white"
const uiTextColor = "white"

const maxWheelSize = 150;
const minWheelSize = 10;
const maxDrawRadiusRatio = 2;

const galleryLW = 2.75 * 1080 / 800;
const gallerySize = 1080;

const dth = PI2 / 100;

// Global vars to cache pointer event state for pinch zoom
var prevDiff = 0;
var curDiff = 0;
var dDiff = 0;

if (X > 1.4 * Y) {
    isLandscape = true;
}
else {
    isLandscape = false;
}
let uiY = 0.2 * Y;
let uiX = X;
let xOff = X / 2;
let yOff = Y / 2;
if (isLandscape) {
    uiY = 0.4 * Y;
    uiX = 0.333 * X;
    xOff = 2 * X / 3;
}

ringSizes = [96, 105]//,144,150]
discSizes = [24, 30, 32, 40, 42, 45, 48, 52, 56, 60, 63, 72, 75, 80, 84]


let fixedDisc = new Disc(ringSizes.random())
let movingDisc = new MovingDisc(discSizes.random(), Math.random() / 2 + 0.5);
let pair = new Pair(fixedDisc, movingDisc)

topPanel = createTopPanel();
sharePanel = createSharePanel();
bottomPanel = createBottomPanel();
panelArray = [topPanel, bottomPanel, sharePanel];

//wake gallery server
fetch(galleryAPIurl)
    .then(response => response.text())
    .then(data => console.log(data));

console.log('devicePixelRatio', window.devicePixelRatio,
    'pixRat', pixRat,
    'innerWidth', window.innerWidth, 'innerHeight', window.innerHeight,
    'sx', screen.width, 'sy', screen.height,
    'window/screen x', window.innerWidth / screen.width,
    'window/screen y', window.innerHeight / screen.height,
    'vVx', window.visualViewport.width, 'vVy', window.visualViewport.height,
    'window/vV x', window.innerWidth / window.visualViewport.width,
    'window/vV y', window.innerHeight / window.visualViewport.height,
    'orientation', window.orientation,

)


document.querySelector(':root').style.setProperty('--bgColor', bgFillStyle)
document.querySelector(':root').style.setProperty('--fgColor', pair.color)
document.querySelector(':root').style.setProperty('--textSize', txtSize / 4 + 'px')
document.getElementById("submit").addEventListener("click", submitToGallery, { passive: true })
document.getElementById("close").addEventListener("click", toggleGalleryForm, { passive: true })
document.getElementById('name').value = localStorage.getItem('name');

addPointerListeners();

let scl = 1.0
// let xOff
canvas.style.backgroundColor = bgFillStyle
// ctx.setTransform(scl,0,0,scl,0,0)

anim();