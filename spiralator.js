Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
}
class Disc {
    constructor(
        teeth = 84, ring = 0
    ) {
        this.x = 0;
        this.y = 0;
        this.thickness = 3 * pixPerTooth;
        this.teeth = teeth;
        this.circ = teeth * pixPerTooth;
        this.rad = this.circ / PI2;
        this.color = 'white';
        this.lw = baseLW * 1;
        this.out = 1;
        this.ring = ring;
    }
    contains(x, y) {
        if (this.ring == 0) {
            return (x - this.x) ** 2 + (y - (this.y)) ** 2 < (this.rad) ** 2
        }
        else {
            let d2CentreSq = (x - this.x) ** 2 + (y - this.y) ** 2
            return (d2CentreSq - this.rad ** 2) *
                (d2CentreSq - (this.rad + this.thickness * this.ring) ** 2) < 0
        }
    }
    draw() {
        if (this.ring == 0) {
            //stroke and fill disk
            ctx.fillStyle = this.color;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.lw;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.rad, 0, PI2);
            ctx.stroke();
            ctx.fillStyle = transCol;
            ctx.fill();
            // central point
            ctx.beginPath();
            ctx.fillStyle = transCol
            ctx.arc(this.x, this.y, 3 * baseLW, 0, PI2);
            ctx.fill();
        }
        else {
            //stroke ring
            ctx.strokeStyle = transCol;
            ctx.lineWidth = this.thickness;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.rad + this.ring * this.thickness / 2, 0, PI2);
            ctx.stroke();
            //ring edges
            ctx.lineWidth = this.lw;
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.rad + this.ring * this.thickness, 0, PI2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.rad, 0, PI2);
            ctx.stroke();
            // central point
            ctx.beginPath();
            ctx.fillStyle = transCol
            ctx.arc(this.x, this.y, 3 * baseLW, 0, PI2);
            ctx.fill();

        }

    }
}
class MovingDisc extends Disc {
    constructor(
        teeth = 84, rat = 0.7, ring = 0
    ) {
        super(teeth, ring)
        this.rat = rat;
        this.th0 = 0;
        this.th = 0;
        this.lw = baseLW * 2;
    }
    draw() {
        super.draw();
        // centre to pen
        ctx.beginPath();
        ctx.strokeStyle = transCol
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x + this.rad * Math.cos(this.th) * this.rat,
            this.y + this.rad * Math.sin(this.th) * this.rat
        )
        ctx.stroke();
        // central point
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(
            this.x, this.y,
            3 * baseLW, 0, PI2);
        ctx.fill();

        // pen point
        ctx.beginPath();
        ctx.fillStyle = pair.color;
        ctx.arc(
            this.x + this.rat * this.rad * Math.cos(this.th),
            this.y + this.rat * this.rad * Math.sin(this.th),
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
    draw(ctx) {
        if (this.points.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = baseLW * 1;
            ctx.moveTo(this.points[0].x, this.points[0].y);
            this.points.forEach(point => {
                ctx.lineTo(point.x, point.y);
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
class ArcSidedDisc extends MovingDisc {
    constructor(
        teeth = 84, rat = 0.7, nArc = 3, arcTeeth = 70, penAngle = 0, ring = false
    ) {
        super(teeth, rat);

        this.thickness = 3 * pixPerTooth;
        this.teeth = teeth; //number of teeth in full circle of arc component
        this.arcTeeth = arcTeeth; //number of teeth in shape circumference
        this.circ = teeth * pixPerTooth; //full circumference of arc
        this.rad = this.circ / PI2; //radius of arcs
        this.circArc = this.arcTeeth * pixPerTooth; //full circumference arc shape
        this.radArc = this.circArc / PI2;
        this.nArc = nArc; //number of arcs

        this.updateShape();

        this.color = 'white';
        this.lw = baseLW * 2;
        // this.out = 1;
        this.ring = ring;
        this.rat = rat;
        this.drawAng = penAngle;

        this.th0 = 0; //rotation angle at pair.th=0, shifted by nudging
        this.th = 0; //current rotation angle
        this.n = 0; //current centre arc

    }
    updateShape() {
        this.circArc = this.arcTeeth * pixPerTooth;
        this.radArc = this.circArc / PI2;
        //call after changing shape params
        if (this.nArc == 1) {
            //special case for n=1, non-zero arcness is impossible
            this.circ = this.arcTeeth * pixPerTooth;
            this.rad = this.circ / PI2
            this.theta = PI2;
            this.phi = PI2;
        }
        else {
            this.circ = this.teeth * pixPerTooth;
            this.rad = this.circ / PI2;
            this.theta = PI2 / 2 / this.nArc; // half angle from geo centre to arc intersect points
            this.phi = this.circArc / (this.rad * 2 * this.nArc);
        }
        this.arcRat = Math.sin(this.theta) / Math.sin(this.phi);
        this.radCont = this.rad / this.arcRat;//radius of containing circle


        // console.log('phi',this.phi*rad2deg)

        // this.phi = Math.asin(Math.sin(this.theta) / this.arcRat);// half angle from arc centre to arc intersect points
        this.drArc = this.rad * (Math.cos(this.phi) - Math.cos(this.theta) / this.arcRat); //dist from geo centre to arc centre
        this.dxArc = []; //offsets from geo centre to arc (rotation) centres
        this.dyArc = [];
        this.dxInt = []; // offsets from geocentre to arc intersection points
        this.dyInt = [];
        let theta0 = this.th;
        for (let i = 0; i < this.nArc; i++) {
            this.dxArc.push(this.drArc * (Math.cos(theta0 + PI2 / 2)));
            this.dyArc.push(this.drArc * (Math.sin(theta0 + PI2 / 2)));
            this.dxInt.push(this.rad * (Math.cos(theta0 + this.theta / 2)));
            this.dyInt.push(this.rad * (Math.sin(theta0 + this.theta / 2)));
            theta0 += this.theta * 2;
        }
    }
    // updateGeoCentre() {
    //     this.x0 = this.x + this.drArc * Math.cos(this.th - this.n * 2 * this.theta);
    //     this.y0 = this.y + this.drArc * Math.sin(this.th - this.n * 2 * this.theta);
    // }

    draw() {
        //set geo (drawing) centre from rotation centre
        // this.updateGeoCentre()

        // // console.log(this.arcRat, this.nArc)
        let theta0 = this.th % PI2;
        let phi = this.phi
        let drArc = this.drArc;

        //stroke and fill disk
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lw;
        ctx.lineCap = "round";
        ctx.fillStyle = transCol;
        ctx.beginPath();
        for (let i = 0; i < this.nArc; i++) {
            ctx.arc(
                this.x0 + drArc * (Math.cos(theta0 + PI2 / 2)),
                this.y0 + drArc * (Math.sin(theta0 + PI2 / 2)),
                this.rad,
                theta0 - phi,
                theta0 + phi,
            );
            // console.log(phi*rad2deg,theta0);
            theta0 += (PI2 / this.nArc);
        }
        ctx.fill();
        ctx.stroke();

        // //draw construction circs
        // ctx.lineWidth = this.lw / 2;
        // for (let i = 0; i < this.nArc; i++) {
        //     ctx.beginPath();
        //     ctx.arc(
        //         this.x0 + drArc * (Math.cos(theta0 + PI2 / 2)),
        //         this.y0 + drArc * (Math.sin(theta0 + PI2 / 2)),
        //         this.rad,
        //         0,
        //         PI2,
        //     );
        //     ctx.stroke();
        //     theta0 += (PI2 / this.nArc);
        // }

        // //containing circle
        // ctx.beginPath();
        // ctx.arc(
        //     this.x0,
        //     this.y0,
        //     this.radCont,
        //     0,
        //     PI2,
        // );
        // ctx.stroke();


        // // centre to edge
        // ctx.strokeStyle = "rgb(200,0,0)"
        // for (let thrad = 0; thrad < PI2; thrad += PI2 / 100) {
        //     let r2a = this.rArc(thrad - this.th);
        //     ctx.beginPath();
        //     ctx.moveTo(this.x0, this.y0);
        //     ctx.lineTo(
        //         this.x0 + r2a * Math.cos(thrad),
        //         this.y0 + r2a * Math.sin(thrad)
        //     )
        //     ctx.stroke();
        // }


        // geocentral point
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(
            this.x0, this.y0,
            3 * baseLW, 0, PI2);
        ctx.fill();

        // // rotocentral point
        // ctx.beginPath();
        // ctx.fillStyle = "blue";
        // ctx.arc(
        //     this.x, this.y,
        //     3 * baseLW, 0, PI2);
        // ctx.fill();

        // // phi
        // ctx.beginPath();
        // ctx.strokeStyle = "red";
        // ctx.moveTo(this.x, this.y);
        // ctx.lineTo(
        //     this.x + this.rad * Math.cos(this.th + this.phi),
        //     this.y + this.rad * Math.sin(this.th + this.phi),
        // )
        // ctx.moveTo(this.x, this.y);
        // ctx.lineTo(
        //     this.x + this.rad * Math.cos(this.th - this.phi),
        //     this.y + this.rad * Math.sin(this.th - this.phi),
        // )
        // ctx.stroke();


        // centre to pen
        ctx.beginPath();
        ctx.strokeStyle = transCol
        ctx.moveTo(this.x0, this.y0);
        ctx.lineTo(
            this.x0 + this.radArc * Math.cos(this.th + this.drawAng) * this.rat,
            this.y0 + this.radArc * Math.sin(this.th + this.drawAng) * this.rat
        )
        ctx.stroke();

        // pen point
        ctx.beginPath();
        ctx.fillStyle = pair.color;
        ctx.arc(
            this.x0 + this.radArc * Math.cos(this.th + this.drawAng) * this.rat,
            this.y0 + this.radArc * Math.sin(this.th + this.drawAng) * this.rat,
            3 * baseLW, 0, PI2
        )
        ctx.fill();


        // ctx.beginPath();

        // ctx.arc(
        //     this.x0 + this.rat * this.radCont * Math.cos(this.th),
        //     this.y0 + this.rat * this.radCont * Math.sin(this.th),
        //     3 * baseLW, 0, PI2);
        // ctx.fill();
    }
    setRat(r) {
        this.rat = r;
    }
    getRat() {
        return (this.rat);
    }
    rArc(tha) {
        let theta = this.theta;
        // tha = ((tha+theta) % (theta*2))-theta;
        tha = ((((tha + theta) % (theta * 2)) + (theta * 2)) % (theta * 2)) - theta
        let phi = this.phi;
        let A = this.drArc;
        // let cosalphr = Math.cos((PI2 / 2) - tha);
        // let rArc = A * cosalphr + Math.sqrt(0.5 * A * cosalphr ** 2 - (A ** 2 - this.arcRat ** 2 * this.rad ** 2));
        let rArc = A * Math.cos(PI2 / 2 - tha) + Math.sqrt((this.rad) ** 2 - A ** 2 * Math.sin(PI2 / 2 - tha) ** 2)
        return rArc;
    }
    contains(x, y) {
        if (this.ring == 0) {
            return (x - this.x0) ** 2 + (y - (this.y0)) ** 2 < (this.radCont) ** 2
        }
        else {
            let d2CentreSq = (x - this.x0) ** 2 + (y - this.y0) ** 2
            return (d2CentreSq - this.radCont ** 2) *
                (d2CentreSq - (this.rad + this.thickness * this.ring) ** 2) < 0
        }
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
        this.locked = true;
        this.updateGeom()
        // console.log("g2a:", this.g2a, "a:", this.moving.drArc, "R:", this.fixed.rad, "r:", this.moving.rad)
        this.setColor();
        this.trace = new Trace(this);
        this.traces = [];
        this.tracing = true;
        this.move(this.th);
    }
    calc_thg(tha, R, r, a) {
        //thg is angle from fixed centre to moving centre, tha is angle from fixed entre to centre of currently rolling arc on moving shape.
        // when rolling multi arc shape, this is used for calculating the angle to the centre of shape (thg) at which shape starts pivoting on corner (at tha)
        let th = tha - Math.asin(a * Math.sin(tha * R / r) / ((R - r) ** 2 + a ** 2 + 2 * a * (R - r) * Math.cos(tha * R / r)) ** 0.5)
        return th
    }
    updateGeom() {
        let m = this.moving;
        let f = this.fixed;
        m.updateShape();
        this.fullTraceTh = PI2 * calcLCM(this.fixed.teeth, this.moving.arcTeeth) / this.fixed.teeth;
        this.arcness = (m.teeth - m.arcTeeth) / (f.teeth - m.arcTeeth); // 0: circle, 1: arcRad = Fixed Rad

        //conversion factor from angle to geo centre to angle to arc centre. based on linear extrapolation using analytic da/dg eval at 0.
        this.g2a = 1 / (1 - m.drArc * (f.rad / m.rad) / (m.drArc + f.rad - m.rad));

        this.tha_pp = (m.phi * m.rad / f.rad) //first pivot point
        if (m.rad == f.rad) {
            this.thg_pp = 0;// always pivot
        }
        else {
            this.thg_pp = this.calc_thg(this.tha_pp, f.rad, m.rad, m.drArc) //first angle to switch to pivoting
        }
        //updateGeoCentre
        m.x0 = m.x + m.drArc * Math.cos(m.th + m.n * 2 * m.theta);
        m.y0 = m.y + m.drArc * Math.sin(m.th + m.n * 2 * m.theta);

        // console.log(m)
    }
    toggleLock() {
        this.locked = !this.locked
    }
    translate(x, y) {
        if (!this.locked) {
            // let auto=this.auto;
            this.auto = false;
            pair.penUp()
            this.fixed.x = x;
            this.fixed.y = y;
            pair.move(pair.th)
            pair.penDown()
            // this.auto=auto
        }
    }
    setColor() {
        this.color = "hsl(" + this.hue + "," + this.saturation + "%," + this.lightness + "%)"
        this.transCol = "hsla(" + this.hue + "," + this.saturation + "%," + this.lightness + "%, 0.3)"
    }
    drawRadInfo() {
        ctx.strokeStyle = this.fixed.color;
        ctx.fillStyle = this.fixed.color;
        ctx.textAlign = "center";
        ctx.font = txtSize + 'px sans-serif';
        ctx.textBaseline = "middle";
        ctx.fillText(Math.round(this.moving.rat * this.moving.teeth), X / 2, Y / 2 + txtSize * 0.9);
        ctx.font = txtSize / 2 + 'px sans-serif';
        ctx.fillText('Pen Radius', X / 2, Y / 2 - txtSize + txtSize * 0.9);

        ctx.font = txtSize + 'px sans-serif';
        ctx.fillText(Math.round(this.moving.drawAng * rad2deg), X / 2, Y / 2 - txtSize * 0.9);
        ctx.font = txtSize / 2 + 'px sans-serif';
        ctx.fillText('Pen Angle', X / 2, Y / 2 - txtSize - txtSize * 0.9);

    }
    drawArcInfo() {
        ctx.strokeStyle = this.fixed.color;
        ctx.fillStyle = this.fixed.color;
        ctx.textAlign = "center";
        ctx.font = txtSize + 'px sans-serif';
        ctx.textBaseline = "middle";
        ctx.fillText(this.moving.nArc, X / 2, Y / 2);
        ctx.font = txtSize / 2 + 'px sans-serif';
        ctx.fillText('N Sides', X / 2, Y / 2 - txtSize);

        ctx.font = txtSize + 'px sans-serif';
        ctx.textBaseline = "middle";
        // ctx.fillText(this.moving.arcTeeth + " <= " + this.arcness.toFixed(3) + " < " + this.fixed.teeth, X / 2, Y / 2 - txtSize * 1.8);
        ctx.fillText((100 * this.arcness).toFixed(0) + "%", X / 2, Y / 2 - txtSize * 1.8);
        ctx.font = txtSize / 2 + 'px sans-serif';
        ctx.fillText('Arcness', X / 2, Y / 2 - txtSize - txtSize * 1.8);

    }
    drawColInfo() {
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.textAlign = "center";
        ctx.font = txtSize + 'px sans-serif';
        ctx.textBaseline = "middle";
        ctx.fillText(Math.round(this.hue), X / 2 - txtSize, Y / 2);
        ctx.fillText(Math.round(this.lightness - 50), X / 2 + txtSize, Y / 2);
        ctx.fillText(Math.round(this.saturation), X / 2, Y / 2 + 2 * txtSize);

        ctx.font = txtSize / 2 + 'px sans-serif';
        ctx.fillText('Hue', X / 2 - txtSize, Y / 2 - txtSize);
        ctx.fillText('Lightness', X / 2 + txtSize, Y / 2 - txtSize);
        ctx.fillText('Saturation', X / 2, Y / 2 + txtSize);


    }
    drawInfo() {
        ctx.strokeStyle = this.fixed.color;
        ctx.fillStyle = this.fixed.color;
        ctx.textAlign = "center";
        ctx.font = txtSize + 'px sans-serif';
        ctx.textBaseline = "middle";
        ctx.fillText(this.fixed.teeth, X / 2 - txtSize * 1.5, Y / 2 - txtSize * 0.45);
        ctx.fillText(this.moving.arcTeeth, X / 2 - txtSize * 1.5, Y / 2 + txtSize * 0.60);
        ctx.fillText(calcLCM(this.fixed.teeth, this.moving.arcTeeth) / this.moving.arcTeeth, X / 2 + 1.5 * txtSize, Y / 2);

        ctx.beginPath();
        ctx.moveTo(X / 2 - txtSize * 2.5, Y / 2 - txtSize * 0.00);
        ctx.lineTo(X / 2 - txtSize * 0.5, Y / 2 - txtSize * 0.00);
        ctx.lineWidth = 3 * pixRat;
        ctx.stroke();

        ctx.font = txtSize / 2 + 'px sans-serif';
        ctx.fillText('Fixed wheel', X / 2 - txtSize * 1.5, Y / 2 - txtSize * 1.5);
        ctx.fillText('Moving wheel', X / 2 - txtSize * 1.5, Y / 2 + txtSize * 1.5);
        ctx.fillText('Symmetry', X / 2 + txtSize * 1.5, Y / 2 + txtSize * -1.0);
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
        this.roll(this.th + .1 * Math.max(Math.abs(this.moving.circArc / this.fixed.circ)) * this.auto);
        // this.roll(this.th + .05 / Math.max(Math.abs(1 - this.fixed.circ / this.moving.circArc), .15) * this.auto);
    }
    nudge(n) {
        this.penUp()
        let thInc = -n * PI2 / this.fixed.teeth;
        if (!this.out) {
            this.moving.th0 += thInc;// * this.fixed.rad / this.moving.rad;
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
    move(th, skipCrossCheck = false) {
        // if (!skipCrossCheck) {
        //     this.checkRollCentreCross(th);
        // }
        let rad2deg = 180 / Math.PI;
        let f = this.fixed;
        let m = this.moving;
        let thg = th - m.th0;
        this.b = m.radCont;
        let alpha = this.thg_pp;
        let beta = this.tha_pp;
        let thg_delta = thg % (2 * beta);
        let n = parseInt(thg / (2 * beta));
        let nPiv = n - (thg < 0);
        let nRoll = n + Math.sign(thg) * (Math.abs(thg_delta) > beta);
        let nSide = nRoll % m.nArc;
        let thPP = beta + 2 * beta * n
        this.nRoll = nRoll;
        if (thg < 0) {
            thPP = beta + 2 * beta * (n - 1);
        }
        this.thPP = thPP;
        let th_piv = thPP - thg;

        let th_rollcentre = nRoll * 2 * beta;
        let tha_roll = (thg - th_rollcentre) * this.g2a;
        m.n = nSide;

        // let tha = th * this.g2a;
        // if (Math.abs(tha) < m.phi * m.rad / f.rad) {
        if ((Math.abs(thg_delta) <= alpha) | (Math.abs(thg_delta) >= (2 * beta - alpha))) {
            // console.log('rolling, n:', nSide,'th:',th*rad2deg)
            // console.log(beta, alpha)
            //set current arc centre and shape rotation

            // let tha = th_rollCentre + (thg - arcCentre) * this.g2a;
            // if (this.out) {
            //     m.x = f.x + (f.rad + m.rad) * Math.cos(tha);
            //     m.y = f.y + (f.rad + m.rad) * Math.sin(tha);
            //     m.th = m.th0 + tha_rel * (f.rad / m.rad + 1)
            // }
            if (!this.out) {
                m.x = f.x + (f.rad - m.rad) * Math.cos(m.th0 + th_rollcentre + tha_roll);
                m.y = f.y + (f.rad - m.rad) * Math.sin(m.th0 + th_rollcentre + tha_roll);
                m.th = m.th0 - (nSide * PI2 / m.nArc) + th_rollcentre - tha_roll * (f.rad / m.rad - 1);
                // console.log(thg - th_rollcentre, this.g2a)
                // console.log(m.x, m.y, m.th)
            }
            //updateGeoCentre
            m.x0 = m.x + m.drArc * Math.cos(m.th + nSide * 2 * m.theta);
            m.y0 = m.y + m.drArc * Math.sin(m.th + nSide * 2 * m.theta);

        }
        else {
            //set shape centre directly
            this.ohm = Math.PI - Math.asin(f.rad / this.b * Math.sin(th_piv))
            this.omg = Math.PI - this.ohm - th_piv
            // this.c = f.rad * Math.sin(this.omg) / Math.sin(this.ohm)
            this.c = ((f.rad - this.b * Math.cos(this.omg)) ** 2 + (this.b * Math.sin(this.omg)) ** 2) ** 0.5
            this.gam = nPiv * 2 * Math.PI / m.nArc - thPP - this.omg + Math.PI / m.nArc;

            if (!this.out) {
                m.x0 = f.x + this.c * Math.cos(m.th0 + thg);
                m.y0 = f.y + this.c * Math.sin(m.th0 + thg);
                m.th = m.th0 - this.gam
            }
            // console.log('pivoting nPiv:', nPiv,'\nn:', nSide,'\nth:',th*rad2deg,'\nm.th:',m.th*rad2deg,'\nc:',this.c,
            // '\nohm',this.ohm,'\nomg:',this.omg,
            // '\nsin(ohm)',Math.sin(this.ohm),'\nsin(omg):',Math.sin(this.omg))
        }
        // console.log('r', m.rad, '\nR', f.rad, '\na', m.drArc, '\nb', this.b, '\nc', this.c,
        // '\nthapp', this.tha_pp * 57, '\nthg', thg * 57, '\nth_d', this.th_d * 57, '\nohm', this.ohm * 57, '\nomg', this.omg * 57, '\ngam', this.gam * 57)
        // console.log('thg', thg * rad2deg, '\nn', n, '\nthg_delta', thg_delta * rad2deg,
        //     '\nalpha', alpha * rad2deg, '\n2a-b', (2 * beta - alpha) * rad2deg,
        //     '\nnRoll', nRoll, '\nroll_centre', th_rollcentre * rad2deg, '\ntha_roll', tha_roll * rad2deg,
        //     '\ngamma', m.th * rad2deg)
        // console.log('thg', thg * rad2deg, '\nn', n, '\nthPP', thPP * rad2deg,'\nth_piv',th_piv,
        //     '\nalpha', alpha * rad2deg, '\nbeta', beta * rad2deg,
        //     '\ngamma', m.th * rad2deg)
        // console.log(this)

        this.th = th;
        if (this.tracing) {
            this.trace.points.push(this.tracePoint());
        }

    }
    draw() {
        // let f = this.fixed;
        // let m = this.moving;
        // // console.log('drawing')
        // ctx.beginPath();
        // ctx.strokeStyle = "red";
        // ctx.moveTo(f.x, f.y);
        // ctx.lineTo(
        //     f.x + f.rad * Math.cos(this.tha_pp),
        //     f.y + f.rad * Math.sin(this.tha_pp),
        // )
        // ctx.stroke();

        // ctx.beginPath();
        // ctx.strokeStyle = "green";
        // ctx.moveTo(f.x, f.y);
        // ctx.lineTo(
        //     m.x0,
        //     m.y0,
        // )
        // ctx.stroke();

        // ctx.beginPath();
        // ctx.strokeStyle = "blue";
        // ctx.moveTo(
        //     f.x + f.rad * Math.cos(this.tha_pp),
        //     f.y + f.rad * Math.sin(this.tha_pp),
        // )
        // ctx.lineTo(
        //     f.x + f.rad * Math.cos(this.tha_pp) - this.b * Math.sin(this.gam),
        //     f.y + f.rad * Math.sin(this.tha_pp) - this.b * Math.cos(this.gam),
        // )
        // ctx.stroke();

    }
    inOut() {
        this.penUp();
        this.out = !pair.out;
        this.configRings();
        // this.fixed.out=-this.fixed.out;
        this.moving.th0 += PI2 / 2;
        this.move(pair.th);
        this.penDown();
    }
    configRings() {
        if (this.out) {
            this.fixed.ring = -1;
            this.moving.ring = 0;
        }
        else if (this.moving.teeth > this.fixed.teeth) {
            this.moving.ring = 1;
            this.fixed.ring = 0;
        }
        else {
            this.moving.ring = 0;
            this.fixed.ring = 1;
        }
    }
    // checkRollCentreCross(th) {

    //     let m = this.moving;
    //     let thg = th - m.th0;
    //     let beta = this.tha_pp;
    //     // let thg_delta = thg % (2 * beta);
    //     let n = parseInt(thg / (2 * beta));
    //     let thPP = beta + 2 * beta * n
    //     if (thg < 0) {
    //         thPP = beta + 2 * beta * (n - 1);
    //     }
    //     //check if local pivot point has changed since last move
    //     if (thPP != this.thPP) {
    //         //if so move to roll centre
    //         console.log("Roll cross:", this.nRoll)
    //         this.move(this.nRoll * 2 * beta, true)
    //     }

    // }

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
                    // console.log(i);
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
        // let startTh = this.th;
        // let traceTh = PI2 * calcLCM(this.fixed.teeth, this.moving.arcTeeth) / this.fixed.teeth
        this.roll(this.th + this.fullTraceTh);
        // this.move(startTh + this.fullTraceTh);
        this.penUp();
        this.penDown();
    }
    oneTrace() {
        this.penUp();
        this.penDown();
        let startTh = this.th;
        this.roll(this.th + PI2);
        this.move(startTh + PI2);
        this.penUp();
        this.penDown();
    }

    tracePoint() {
        let m = this.moving;
        let x = m.x0 + Math.cos(m.th + m.drawAng) * (m.radArc * m.rat)
        let y = m.y0 + Math.sin(m.th + m.drawAng) * (m.radArc * m.rat)
        return (new Point(x, y));
    }
    drawTraces(ctx) {
        // console.log(xoff,yoff)
        this.traces.forEach(trace => {
            trace.draw(ctx);
        })
        this.trace.draw(ctx);
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
class PButton {
    constructor(panel, x, y, w, h, txt, fun, argObj, getXdragVar, getYdragVar, isDepressedFun, toggleValFun) {
        this.x = panel.x + x * panel.w;
        this.y = panel.y + y * panel.h;
        this.w = w * panel.w;
        this.h = h * panel.h;
        this.txt = txt;
        this.nTxtLines = txt.length;
        // console.log(this.nTxtLines);
        this.fun = fun;
        this.argObj = argObj;
        this.depressed = false;
        this.xDrag = false;
        this.yDrag = false;
        this.toggle = false;
        this.toggleValFun = toggleValFun;
        this.y0;
        this.x0;
        this.xVar0;
        this.yVar0;
        this.getYdragVar = getYdragVar;
        this.getXdragVar = getXdragVar;
        this.isDepressedFun = isDepressedFun;
        this.UDarrows = false;
        this.LRarrows = false;
        this.UDarrLen = this.h / 6;
        this.LRarrLen = this.w / 6;
    }
    draw() {
        ctx.strokeStyle = pair.color;
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.w, this.h);
        ctx.stroke();

        if (this.depressed) {
            ctx.fillStyle = pair.color;
            ctx.fillRect(this.x, this.y, this.w, this.h)
        }
        if (this.toggle) {
            if (this.toggleValFun()) {
                ctx.fillStyle = pair.transCol;
                ctx.fillRect(this.x, this.y, this.w, this.h)
            }
        }
        if (this.UDarrows) {
            let hspace = .8 * this.nTxtLines * txtSize / 4;
            drawArrow(ctx,
                this.x + this.w / 2, this.y + this.h / 2 + hspace,
                this.x + this.w / 2, this.y + this.h / 2 + hspace + this.UDarrLen,
                baseLW, uiTextColor)
            drawArrow(ctx,
                this.x + this.w / 2, this.y + this.h / 2 - hspace,
                this.x + this.w / 2, this.y + this.h / 2 - hspace - this.UDarrLen,
                baseLW, uiTextColor)
        }
        if (this.LRarrows) {
            drawArrow(ctx,
                this.x + this.w / 2 - txtSize / 2, this.y + this.h / 2,
                this.x + this.w / 2 - txtSize / 2 - this.LRarrLen, this.y + this.h / 2,
                baseLW, uiTextColor)
            drawArrow(ctx,
                this.x + this.w / 2 + txtSize / 2, this.y + this.h / 2,
                this.x + this.w / 2 + txtSize / 2 + this.LRarrLen, this.y + this.h / 2,
                baseLW, uiTextColor)
        }

        ctx.fillStyle = uiTextColor;
        ctx.textAlign = "center";
        ctx.font = txtSize / 4 + 'px sans-serif';
        ctx.textBaseline = "middle";
        ctx.lineWidth = baseLW;
        // for (let i=0; i<this.nTxtLines;i++){
        //     ctx.fillText(this.txt[i], this.x + this.w / 2, this.y + this.h / 2, this.w * 0.9); 
        // }
        if (this.nTxtLines == 1) {
            ctx.fillText(this.txt, this.x + this.w / 2, this.y + this.h / 2, this.w * 0.9);
        }
        if (this.nTxtLines == 2) {
            ctx.fillText(this.txt[0], this.x + this.w / 2, this.y + this.h / 2 - .6 * txtSize / 4, this.w * 0.9);
            ctx.fillText(this.txt[1], this.x + this.w / 2, this.y + this.h / 2 + .6 * txtSize / 4, this.w * 0.9);
        }
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
function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
}
function addPointerListeners() {
    window.addEventListener("resize", () => {
        setSize()
        if (!pair.auto) { requestAnimationFrame(anim); }
    }
    );

    if (isTouchDevice()) {
        canvas.addEventListener("touchstart", e => {
            e.preventDefault();
            // This event is cached to support 2-finger gestures
            // console.log("pointerDown", e);
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
                        (e.touches[0].clientX + e.touches[1].clientX) / 2,
                        (e.touches[0].clientY + e.touches[1].clientY) / 2)
                }
                prevDiff = curDiff;
                if (!pair.auto) { requestAnimationFrame(anim); }
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
            mouseDown = true
        },
            // { passive: false }
        );
        addEventListener('mousemove', e => {
            if (mouseDown) {
                pointerMoveHandler(e.clientX, e.clientY)
            }
        });
        addEventListener('mouseup', e => {
            mouseDown = false
            pointerUpHandler(e.clientX, e.clientY);

        });
        addEventListener('wheel', e => {
            // console.log(e)
            pointerWheelHandler(-0.0005 * e.deltaY, e.clientX, e.clientY);

        })
    }
}
function pointerWheelHandler(dW, xc, yc) {
    zoomHandler(dW, xc, yc);
    if (!pair.auto) { requestAnimationFrame(anim); }
}
function pointerDownHandler(xc, yc, n = 1) {
    let x = xc * pixRat;
    let y = yc * pixRat;

    if (!showgalleryForm) {
        panelArray.forEach(panel => panel.pointerDown(x, y))


        let now = new Date().getTime();
        let timeSince = now - lastTouch;
        if (timeSince < 300 & n < 2) {
            //double touch
            doubleClickHandler(clickCase);
        }
        lastTouch = now;

        if ((y > 0.4 * Y & y < (Y - uiHeight) & orient == "wideandtall") ||
            ((y > .5 * Y & y < (Y - uiHeight)) & orient == "tallorsquare") ||
            ((y > .5 * Y & y < Y & x > uiButtonsWidth) & orient == "wideandshort")) {
            clickCase = "autoCW";

        }
        else if ((y < 0.4 * Y & orient == "wideandtall") ||
            ((y < .5 * Y & y > (uiHeight)) & orient == "tallorsquare") ||
            ((y < .5 * Y & y > 0 & x > uiButtonsWidth) & orient == "wideandshort")) {
            clickCase = "autoCCW";
        }
        else {
            clickCase = null;
        }
    }

    xt = (x - xOff) / (scl)
    yt = (y - yOff) / (scl)

    if (!pair.auto & showWheels & pair.moving.contains(xt, yt)) {
        mselect = "moving";
        thDragSt = Math.atan2(yt - pair.fixed.y, xt - pair.fixed.x);
    }
    else if (showWheels & pair.fixed.contains(xt, yt)) {
        mselect = "fixed";
        y0 = y;
        x0 = x;
        xfix0 = pair.fixed.x;
        yfix0 = pair.fixed.y;
    }

    else if (
        (topPanel.active &
            (orient == "wideandtall" & y < (Y - uiHeight)) ||
            (orient == "tallorsquare" & y > uiHeight & y < (Y - uiHeight)) ||
            (orient == "wideandshort" & x > uiButtonsWidth)
        ) ||
        !topPanel.active
    ) {
        mselect = "pan";
        y0 = y;
        x0 = x;
        xOff0 = xOff;
        yOff0 = yOff;
    }
    else {
        mselect = null;
    }
    if (!pair.auto) { requestAnimationFrame(anim); }
}
function pointerMoveHandler(xc, yc) {
    x = xc * pixRat;
    y = yc * pixRat;
    xt = (x - xOff) / scl
    yt = (y - yOff) / scl

    panelArray.forEach(panel => panel.pointerMove(x, y));
    if (mselect == "moving") {
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
    if (mselect == "fixed") {
        pair.translate(xfix0 + (x - x0) / scl, yfix0 + (y - y0) / scl)
    }


    if (mselect == "pan") {
        xOff = xOff0 + (x - x0);
        yOff = yOff0 + (y - y0);
    }
    if (!pair.auto) { requestAnimationFrame(anim); }

}
function pointerUpHandler(xc, yc) {
    x = xc * pixRat;
    y = yc * pixRat;

    showWheelsOverride = false;
    pair.fixed.color = wheelColor;
    pair.moving.color = wheelColor;
    mselect = null;

    panelArray.forEach(panel => panel.pointerUp(x, y))
    if (!pair.auto) { requestAnimationFrame(anim); }
}
function doubleClickHandler(clickCase) {
    if (topPanel.active) {
        if ((clickCase == "autoCCW" || clickCase == "autoCW") & pair.auto != 0) {
            pair.auto = 0;
            playDemo = 0;
        }
        else if (clickCase == "autoCCW") {
            pair.auto = -1;
            anim(); //get the ball rolling...
        }
        else if (clickCase == "autoCW") {
            pair.auto = 1;
            anim();
        }
    }
    if (!showWheels) {
        showWheels = true;
    }
    else {
        topPanel.active = true;
        bottomPanel.active = true;
        shapePanel.active = true;
    }




}
function zoomHandler(dW, xc, yc) {

    y = yc * pixRat;
    x = xc * pixRat;
    xt = (x - xOff) / scl
    yt = (y - yOff) / scl

    scl = Math.min(10, Math.max(scl * (1 + dW), 0.05));
    xOff = x - xt * scl
    yOff = y - yt * scl


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
function drawSquareFullImage(n = 1920) {
    pair.penUp();
    let baseLWtemp = baseLW;
    baseLW = galleryLW * baseLW;
    let tracesBounds = pair.getTracesBounds();
    let size = (shareBorderfrac + 1) * Math.max(
        tracesBounds.xmax - tracesBounds.xmin,
        tracesBounds.ymax - tracesBounds.ymin
    )
    let imscl = n / size;
    let xoff = imscl * (-tracesBounds.xmin + (size - (tracesBounds.xmax - tracesBounds.xmin)) / 2);
    let yoff = imscl * (- tracesBounds.ymin + (size - (tracesBounds.ymax - tracesBounds.ymin)) / 2);

    // console.log(size, xoff, yoff, imscl);
    var canvasSh = document.createElement('canvas');
    canvasSh.width = n;
    canvasSh.height = n;
    var ctxSh = canvasSh.getContext('2d');
    ctxSh.fillStyle = bgFillStyle;
    // canvasSh.style.backgroundColor=bgFillStyle
    // canvasSh.style.backgroundColor = bgFillStyle
    ctxSh.fillRect(0, 0, canvasSh.width, canvasSh.height);
    ctxSh.setTransform(imscl, 0, 0, imscl, xoff, yoff)
    pair.drawTraces(ctxSh);
    baseLW = baseLWtemp;
    return (canvasSh)
}
function shareImage() {
    if (pair.traces.length > 0) {
        sharePanel.wait = true;
        canvasSq = drawSquareFullImage(shareRes);
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
            anim()
        })
    }
}
function uploadImage(name, comment) {
    if (pair.traces.length > 0) {
        sharePanel.wait = true;
        anim();
        canvasSq = drawSquareFullImage(galleryRes);
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
                    anim()
                })
                .catch((error) => {
                    console.error('Error:', error);
                    sharePanel.wait = false;
                    anim()
                });
        })
    }
}
function createSharePanel() {
    xsize = 200 * pixRat;
    ysize = 400 * pixRat;
    let panel = new Panel((X - xsize) / 2, (Y - ysize) / 2, xsize, ysize);
    panel.overlay = true;
    // panel.wait=true;
    panel.active = false;
    panel.buttonArray.push(
        new PButton(panel, 0.0, 0, 1, 0.1, ["Close"],
            function () { panel.active = false; })
    );
    panel.buttonArray.push(
        new PButton(panel, 0.1, .2, .8, 0.1, ["Share Image"],
            function () { shareImage(); })
    );
    panel.buttonArray.push(
        new PButton(panel, 0.1, .5, .8, 0.1, ["Upload to Gallery"],
            function () { toggleGalleryForm() })
    );
    panel.buttonArray.push(
        new PButton(panel, 0.1, .8, .8, 0.1, ["View Gallery"],
            function () { window.location.href = 'gallery.html' })
    );

    return (panel);

}
function createButtonsPanel() {

    let panel = new Panel(uiButtonsX + uiBorder, uiButtonsY + uiBorder, uiButtonsWidth - 2 * uiBorder, uiHeight - 2 * uiBorder);
    panel.anyClickActivates = true;

    panel.buttonArray.push(
        new PButton(panel, 0.0, 0.0, 0.25, 0.333, ["Share"],
            function () { sharePanel.active = true; })
    );
    panel.buttonArray.push(
        new PButton(panel, 0.0, 0.333, 0.25, 0.333, ["Hide", "UI"],
            function () {
                // showUI = false;
                showWheels = false;
                panelArray.forEach(panel => panel.active = false)
            })
    );

    panel.buttonArray.push(
        new PButton(panel, .0 + 0.125, 0.666, 0.125, 0.333, ["Init"],
            function () {
                init()

            })
    );

    let demoButton = new PButton(panel, .0 + 0.0, 0.666, 0.125, 0.333, ["Demo"],
        function () { return toggleDemo(); },
        [], [], [], null,
        function () { return playDemo; })
    demoButton.toggle = true;
    panel.buttonArray.push(demoButton);



    panel.buttonArray.push(
        new PButton(panel, 0.25, .0, 0.25, 0.333, ["Clear", "All"],
            function () { pair.clearAll() })
    );
    panel.buttonArray.push(
        new PButton(panel, 0.25, .333, 0.25, 0.666, ["Undo"],
            function () { pair.clear(); })
    );



    panel.buttonArray.push(
        new PButton(panel, 0.5, 0, 0.25, 0.333, ["Invert"],
            function () { pair.inOut(); })
    );
    panel.buttonArray.push(
        new PButton(panel, 0.5, .333, 0.25, 0.333, ["Nudge +"],
            function () { return pair.nudge(1); })
    );
    panel.buttonArray.push(
        new PButton(panel, 0.5, .666, 0.25, 0.333, ["Nudge -"],
            function () { return pair.nudge(-1); })
    );

    panel.buttonArray.push(
        new PButton(panel, 0.75, 0, 0.125, 0.333, ["Reset"],
            function () { return pair.reset(); })
    );

    let lockButton = new PButton(panel, 0.875, 0, 0.125, 0.333, ["Lock", "Ring"],
        function () { return pair.toggleLock(); },
        [], [], [], null,
        function () { return pair.locked; })
    lockButton.toggle = true;
    panel.buttonArray.push(lockButton);


    panel.buttonArray.push(
        new PButton(panel, 0.75, .6666, 0.25, 0.3333, ["Complete"],
            function () { pair.fullTrace() })
    );

    panel.buttonArray.push(
        new PButton(panel, 0.75, .3333, 0.25, 0.3333, ["Trace 360°"],
            function () { pair.oneTrace() })
    );

    return (panel)
}
function createSliderPanel() {
    let panel = new Panel(uiSlidersX + uiBorder, uiSlidersY + uiBorder, uiSlidersWidth - 2 * uiBorder, uiHeight - 2 * uiBorder);
    panel.anyClickActivates = true;

    let fixRadButton = new PButton(panel, 0 / 6, 0, 1 / 6, 1, ["Fixed", "Size"],
        function (dy, yDragVar0) {
            showWheelsOverride = true;
            pair.penUp();
            pair.fixed.teeth = Math.round(Math.min(maxWheelSize, Math.max(-0.1 / pixRat * dy + yDragVar0, pair.moving.teeth + 1)));
            // if (pair.fixed.teeth == pair.moving.teeth) {
            //     pair.fixed.teeth--;
            // }
            pair.configRings()
            pair.fixed.circ = pair.fixed.teeth * pixPerTooth;
            pair.fixed.rad = pair.fixed.circ / PI2
            pair.updateGeom();
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
    fixRadButton.UDarrows = true;
    panel.buttonArray.push(fixRadButton)

    let arcTeethButton = new PButton(panel, 1 / 6, 0, 1 / 6, 1, ["Moving", "Size"],
        function (dy, yDragVar0) {
            showWheelsOverride = true;
            pair.penUp();
            pair.moving.arcTeeth = Math.round(Math.min(pair.fixed.teeth - 1, Math.max(-0.05 / pixRat * dy + yDragVar0, 10)))
            //need to use same definition of arcness to define moving.teeth, as using in pair.updateGeom()
            pair.moving.teeth = pair.arcness * (pair.fixed.teeth - pair.moving.arcTeeth) + pair.moving.arcTeeth
            pair.updateGeom();
            pair.move(pair.th);
            pair.penDown();

        }, [], [],
        function () {
            return pair.moving.arcTeeth;
        },
        function (isDepressed) {
            // showArcInfo = isDepressed;
            showInfo = isDepressed;
        },
    )
    arcTeethButton.yDrag = true;
    arcTeethButton.UDarrows = true;
    panel.buttonArray.push(arcTeethButton)


    let movRadButton = new PButton(panel, 3 / 6, 0, 1 / 6, 1, ["Arcness"],
        function (dy, yDragVar0) {
            showWheelsOverride = true;
            pair.penUp();
            pair.moving.teeth = Math.round(Math.min(pair.fixed.teeth - 5, Math.max(-0.4 / pixRat * dy + yDragVar0, pair.moving.arcTeeth)));
            // enable to to prevent 100% arcness problems
            if (pair.moving.teeth == pair.fixed.teeth) {
                pair.moving.teeth--;
            }
            pair.configRings()

            pair.moving.circ = pair.moving.teeth * pixPerTooth;
            pair.moving.rad = pair.moving.circ / PI2
            pair.updateGeom();
            pair.move(pair.th);
            pair.penDown();
        }, [], [],
        function () {
            return pair.moving.teeth;
        },
        function (isDepressed) {
            showArcInfo = isDepressed;
        }
    )
    movRadButton.yDrag = true;
    movRadButton.UDarrows = true;
    panel.buttonArray.push(movRadButton)



    let nArcsButton = new PButton(panel, 2 / 6, 0, 1 / 6, 1, ["# Sides"],
        function (dy, yDragVar0) {

            showWheelsOverride = true;
            pair.penUp();
            pair.moving.nArc = Math.round(Math.min(7, Math.max(-0.05 / pixRat * dy + yDragVar0, 1)));
            // if (pair.moving.teeth == pair.fixed.teeth) {
            //     pair.moving.teeth--;
            // }
            pair.updateGeom();
            pair.configRings()

            pair.move(pair.th);
            pair.penDown();
        }, [], [],
        function () {
            return pair.moving.nArc;
        },
        function (isDepressed) {
            showArcInfo = isDepressed;
        }
    )
    nArcsButton.yDrag = true;
    nArcsButton.UDarrows = true;
    panel.buttonArray.push(nArcsButton)

    let ratButton = new PButton(panel, 4 / 6, 0, 1 / 6, 1, ["Pen", "Radius"],
        function (dy, yDragVar0) {
            showWheelsOverride = true;
            pair.penUp();
            pair.moving.rat = Math.min(maxDrawRadiusRatio, Math.max(-0.002 / pixRat * dy + yDragVar0, 0))
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
    ratButton.UDarrows = true;
    panel.buttonArray.push(ratButton)

    let angButton = new PButton(panel, 5 / 6, 0, 1 / 6, 1, ["Pen", "Angle"],
        function (dy, yDragVar0) {
            showWheelsOverride = true;
            pair.penUp();
            pair.moving.drawAng = Math.min(PI2 / 2, Math.max(-0.01 / pixRat * dy + yDragVar0, -PI2 / 2))
            pair.penDown();

        }, [], [],
        function () {
            return pair.moving.drawAng;
        },
        function (isDepressed) {
            showRadInfo = isDepressed;
        },
    )
    angButton.yDrag = true;
    angButton.UDarrows = true;
    panel.buttonArray.push(angButton)

    return panel;


}
function createShapePanel() {
    let nButs = 3;

    let panel = new Panel(uiShapeX + uiBorder, uiShapeY + uiBorder, uiShapeWidth - 2 * uiBorder, uiHeight - 2 * uiBorder);
    panel.anyClickActivates = true;

    let hueButton = new PButton(panel, 0 / nButs, 0, 1 / nButs, 1, ["Hue"],
        function (dy, yDragVar0) {

            pair.move(pair.th);
            pair.penUpCont();

            pair.hue = yDragVar0 - 0.5 / pixRat * dy;
            if (pair.hue > 360) {
                pair.hue -= 360;
            }
            if (pair.hue < 0) {
                pair.hue += 360;
            }
            // console.log(dy, yDragVar0, dx, xdragVar0)
            // pair.lightness = Math.max(00, Math.min(100, xdragVar0 + dx * 0.25/pixRat));

            pair.setColor();
            pair.fixed.color = pair.color;
            pair.moving.color = pair.color;
            document.querySelector(':root').style.setProperty('--fgColor', pair.color)
            pair.move(pair.th);
            pair.penDown();

        }, [], [],
        function () {
            return pair.hue;
        },
        function (isDepressed) {
            showColInfo = isDepressed;
        }
    )
    hueButton.yDrag = true;
    // colButton.xDrag = true;
    hueButton.UDarrows = true;
    // colButton.LRarrows = true;
    panel.buttonArray.push(hueButton)

    let lightnessButton = new PButton(panel, 1 / nButs, 0, 1 / nButs, 1, ["Lightness"],
        function (dy, yDragVar0) {

            pair.move(pair.th);
            pair.penUpCont();

            pair.lightness = Math.max(00, Math.min(100, yDragVar0 + dy * -0.25 / pixRat));

            pair.setColor();
            pair.fixed.color = pair.color;
            pair.moving.color = pair.color;
            document.querySelector(':root').style.setProperty('--fgColor', pair.color)
            pair.move(pair.th);
            pair.penDown();

        }, [], [],
        function () {
            return pair.lightness;
        },
        function (isDepressed) {
            showColInfo = isDepressed;
        }
    )
    lightnessButton.yDrag = true;
    // colButton.xDrag = true;
    lightnessButton.UDarrows = true;
    // colButton.LRarrows = true;
    panel.buttonArray.push(lightnessButton)

    let satButton = new PButton(panel, 2 / nButs, 0, 1 / nButs, 1, ["Saturation"],
        function (dy, yDragVar0) {

            pair.move(pair.th);
            pair.penUpCont();

            pair.saturation = Math.max(00, Math.min(100, yDragVar0 + dy * -0.25 / pixRat));

            pair.setColor();
            pair.fixed.color = pair.color;
            pair.moving.color = pair.color;
            document.querySelector(':root').style.setProperty('--fgColor', pair.color)
            pair.move(pair.th);
            pair.penDown();

        }, [], [],
        function () {
            return pair.saturation;
        },
        function (isDepressed) {
            showColInfo = isDepressed;
        }
    )
    satButton.yDrag = true;
    // colButton.xDrag = true;
    satButton.UDarrows = true;
    // colButton.LRarrows = true;
    panel.buttonArray.push(satButton)


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
function setGallerySubmitHTML() {
    document.querySelector(':root').style.setProperty('--bgColor', bgFillStyle)
    document.querySelector(':root').style.setProperty('--fgColor', fgFillStyle)
    document.querySelector(':root').style.setProperty('--textSize', 12 + 'pt')
    document.getElementById("submit").addEventListener("click", submitToGallery, { passive: true })
    document.getElementById("close").addEventListener("click", toggleGalleryForm, { passive: true })
    document.getElementById('name').value = localStorage.getItem('name');
}
function wakeGalleryServer() {
    fetch(galleryAPIurl)
        .then(response => response.text())
        .then(data => console.log(data));

}
function toggleDemo() {
    playDemo = !playDemo;
    if (pair.auto == 0) {
        pair.auto = playDemo;
        requestAnimationFrame(anim);
    }
    else {
        pair.auto = playDemo;
    }
    console.log(playDemo);

}
function anim() {
    if (pair.auto) { requestAnimationFrame(anim); }

    if (playDemo & Math.abs(pair.th) > (pair.fullTraceTh + PI2)) {
        init();
        pair.auto = 1;
    }

    if (pair.auto & !showColInfo & !showInfo & !showRadInfo & !showArcInfo) {
        pair.update();
    }

    // clear screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //scaled stuff
    ctx.setTransform(scl, 0, 0, scl, xOff, yOff)
    pair.drawTraces(ctx);


    if (showWheels | showWheelsOverride) {
        pair.fixed.draw();
        pair.moving.draw();
        pair.draw();
    }


    // fixed stuff
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    panelArray.forEach(panel => panel.draw())

    if (showInfo) {
        pair.drawInfo();
    }
    if (showArcInfo) {
        pair.drawArcInfo();
    }
    if (showRadInfo) {
        pair.drawRadInfo();
    }
    if (showColInfo) {
        pair.drawColInfo();
    }

    // ctx.textAlign = "left"
    // ctx.fillText('auto: ' + pair.auto, 20, uiY + 20)
    // ctx.fillText('xOff='+Math.round(xOff * 10000) / 10000, 20, uiY + 110)
    // ctx.fillText('scl='+Math.round(scl * 10000) / 10000, 20, uiY + 140)
    // ctx.fillText('v21', 10, Y - 15)

}
function drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color) {
    //variables to be used when creating the arrow
    var headlen = 10 * pixRat;
    var angle = Math.atan2(toy - fromy, tox - fromx);

    // ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;


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
    ctx.fill();
    // ctx.restore();
}
function setSize() {
    pixRat = window.devicePixelRatio * 1.0;

    canvas.height = window.innerHeight * pixRat;
    canvas.width = window.innerWidth * pixRat;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    X = canvas.width;
    Y = canvas.height;

    scl = 1.1;
    txtSize = 60 * pixRat;
    baseLW = 1 * pixRat;
    pixPerTooth = 9 * pixRat;

    nOscButtons = 13;
    minPanelWidth = 60 * pixRat
    uiBorder = 5 * pixRat;


    if (X > minPanelWidth * nOscButtons & window.innerHeight > 500) {
        //wide and tall enough
        pixPerTooth = 12 * pixRat
        orient = "wideandtall"
        console.log('wide and tall enough')
        uiHeight = 0.2 * Y;

        uiButtonsWidth = minPanelWidth * 4;
        uiSlidersWidth = minPanelWidth * 6;
        uiShapeWidth = minPanelWidth * 3;

        uiButtonsX = (X - nOscButtons * minPanelWidth) / 2;
        uiSlidersX = uiButtonsX + uiButtonsWidth;
        uiShapeX = uiSlidersX + uiSlidersWidth;

        uiButtonsY = Y - uiHeight;
        uiSlidersY = Y - uiHeight;
        uiShapeY = uiSlidersY;

        xOff = X / 2;
        yOff = Y * 0.4;

        scl = 1.5

    }
    else if (window.innerHeight < 500 & window.innerWidth > 800) {
        // wide and short
        console.log('wide and  short')
        orient = "wideandshort";
        uiHeight = 0.5 * Y;
        uiButtonsWidth = 0.333 * X;
        uiSlidersWidth = uiButtonsWidth * 6 / 9;
        uiShapeWidth = uiButtonsWidth * 3 / 9;
        uiButtonsX = 0;
        uiButtonsY = 0;
        uiSlidersX = 0;
        uiSlidersY = Y - uiHeight;
        uiShapeX = uiSlidersWidth;
        uiShapeY = Y - uiHeight;

        xOff = 2 * X / 3;
        yOff = Y * .5;
    }
    else {
        //tall or squarish
        // console.log('tall or squarish')
        orient = "tallorsquare"
        uiHeight = 0.2 * Y;

        uiButtonsWidth = X;
        uiSlidersWidth = X * (6 / 9);
        uiShapeWidth = X * (3 / 9);

        uiButtonsX = (X - 1 * uiButtonsWidth) / 2;
        uiButtonsY = 0;
        uiSlidersX = (X - 1 * uiButtonsWidth) / 2;
        uiSlidersY = Y - uiHeight;
        uiShapeX = (X - 1 * uiButtonsWidth) / 2 + (6 / 9) * uiButtonsWidth;
        uiShapeY = Y - uiHeight;

        xOff = X * .5;
        yOff = Y * .5;
    }

    topPanel = createButtonsPanel();
    sharePanel = createSharePanel();
    bottomPanel = createSliderPanel();
    shapePanel = createShapePanel();
    panelArray = [topPanel, bottomPanel, shapePanel, sharePanel];
}

const canvas = document.getElementById("cw");
const ctx = canvas.getContext("2d");
const PI2 = Math.PI * 2;

const rad2deg = 180 / Math.PI;

let clickCase = null;
let mouseDown = false;
let lastTouch = new Date().getTime();
let showWheels = true;
let showWheelsOverride = false;
let showInfo = false;
let showRadInfo = false;
let showColInfo = false;
let showgalleryForm = false;
let showArcInfo = false;
let playDemo = false;

const shareBorderfrac = 0.15;
const transCol = "rgb(128,128,128,0.2)"
const wheelColor = "white"
const uiTextColor = "white"
const maxWheelSize = 300;
const minWheelSize = 10;
const maxDrawRadiusRatio = 2;

const galleryLW = 1;
const galleryRes = 1920;
const shareRes = 1920;


const dth = PI2 / 200; // PI2/200 default

//vars for pinch zoom handling
var prevDiff = 0;
var curDiff = 0;
var dDiff = 0;

ringSizes = [96, 105]//,144,150]
discSizes = [24, 30, 32, 40, 42, 45, 48, 52, 56, 60, 63, 72, 75, 80, 84]


let fgFillStyle, bgFillStyleAlpha, bgFillStyle, hueInit, pair, uiSlidersX, uiSlidersY, uiSlidersWidth, pixRat, X, Y, scl, txtSize, baseLW, pixPerTooth, xOff, yOff, uiButtonsX, uiButtonsY, uiButtonsWidth, uiShapeX, uiShapeY, uiShapeWidth;
setSize();

function init() {
    hueInit = Math.random() * 360
    bgFillStyle = "hsl(" + hueInit + ",100%,5%)";
    bgFillStyleAlpha = "hsla(" + hueInit + ",100%,5%,.8)"
    fgFillStyle = "hsl(" + hueInit + ",100%,50%)"
    setGallerySubmitHTML();
    canvas.style.backgroundColor = bgFillStyle
    let arcTeethInit = discSizes.random();
    let fixedTeeth = ringSizes.random()
    let nArcs = (Math.random() < 0.5) ? 1 : 2 + Math.floor(Math.random() * 3);
    let movingTeeth = arcTeethInit + (0.2 + Math.random() * 0.6) * (fixedTeeth - arcTeethInit);
    let penAngle = (Math.random() < 0.5) ? (Math.random() < 0.5 ? 0 : 0.5 * PI2 / nArcs) : Math.random() * PI2;
    let fixedDisc = new Disc(fixedTeeth, ring = 1);
    let movingDisc = new ArcSidedDisc(movingTeeth, Math.random(), nArcs, arcTeeth = arcTeethInit, penAngle = penAngle, ring = 0);
    // let fixedDisc = new Disc(105, ring = 1);
    // let movingDisc = new ArcSidedDisc(84, .5, nArc = 1, arcTeeth = 84, ring = 0);
    pair = new Pair(fixedDisc, movingDisc)
}

// pair.auto=1;
// pair.nudge(6)
// pair.oneTrace();
// pair.oneTrace();
// pair.fullTrace();
// pair.penUp()
// pair.roll(PI2*4)

// pair.penDown()
// pair.move(14* PI2 / 100)
// pair.move(15* PI2 / 100)
// pair.move(16* PI2 / 100)

wakeGalleryServer()
addPointerListeners();

// let traceTh=PI2*calcLCM(pair.fixed.teeth, pair.moving.arcTeeth) / pair.fixed.teeth
// let startTh=pair.th;
// pair.roll(pair.th + traceTh);
// console.log(startTh,calcLCM(pair.fixed.teeth, pair.moving.arcTeeth) / pair.fixed.teeth)
// pair.move(4*PI2);

// showWheels = false;
// panelArray.forEach(panel => panel.active = false)

init()
anim();

