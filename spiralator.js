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
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Trace {
    constructor(pair, alpha = 1) {
        this.points = [];

        if (alpha == 1) {
            // console.log("normal mode:" + alpha)
            this.color = "hsl(" + pair.hue + "," + pair.saturation + "%," +
                pair.lightness + "%)";
        }
        else {
            // console.log("alpha mode:"+alpha)
            this.color = "hsla(" + pair.hue + "," + pair.saturation + "%," +
                pair.lightness + "%," + alpha + ")";
        }
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
class ArcSidedDisc {
    constructor(
        perimTeeth = 70, arcness = 0.2, rat = 0.7, nArc = 3, penAngle = 0, ring = false
    ) {
        this.x = 0;
        this.y = 0;
        this.thickness = 3 * pixPerTooth;
        this.color = 'white';
        this.ring = ring;
        this.rat = rat;
        this.drawAng = penAngle;
        this.lw = baseLW * 2;

        this.th0 = 0; //rotation angle at pair.th=0, shifted by nudging

        this.perimTeeth = perimTeeth; //number of teeth in shape perimeter
        this.perim = this.perimTeeth * pixPerTooth; //full perimeter arc shape
        this.arcness = arcness;
        this.nArc = nArc; //number of arcs

        // below values are set by Pair.updateMovingShape() after any change, 
        // should usually be followed by an update of pair geom
        // this.teeth = teeth; //number of teeth in full circle of arc component
        // this.circ = teeth * pixPerTooth; //full circumference of arc
        // this.rad = this.circ / PI2; //radius of arcs
        // this.phi = half angle subtended by arcs
        // this.theta = half angle from centre to subsequent vertices
        // this.arcRat = Math.sin(this.theta) / Math.sin(this.phi);
        // this.radCont = this.rad / this.arcRat;//radius of containing circle
        // this.drArc = this.rad * (Math.cos(this.phi) - Math.cos(this.theta) / this.arcRat); 
        //dist from geo centre to arc centre

    }


    draw() {
        //set geo (drawing) centre from rotation centre
        // this.updateGeoCentre()

        // // console.log(this.arcRat, this.nArc)
        let theta0 = this.th % PI2;
        let phi = this.phi
        let drArc = this.drArc;

        //stroke and fill disk
        if (this.ring == 0) {
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


        // // //draw construction circs
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
        // ctx.lineWidth = this.lw / 2;
        // ctx.setLineDash([10, 7]);
        // ctx.arc(
        //     this.x0,
        //     this.y0,
        //     this.radCont,
        //     0,
        //     PI2,
        // );
        // ctx.stroke();
        // ctx.setLineDash([]);

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


        // // geocentral point
        // ctx.beginPath();
        // ctx.fillStyle = this.color;
        // ctx.arc(
        //     this.x0, this.y0,
        //     3 * baseLW, 0, PI2);
        // ctx.fill();

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
        //     this.x + 1 * this.rad * Math.cos(this.th + this.phi),
        //     this.y + 1 * this.rad * Math.sin(this.th + this.phi),
        // )
        // ctx.moveTo(this.x, this.y);
        // ctx.lineTo(
        //     this.x + 1 * this.rad * Math.cos(this.th - this.phi),
        //     this.y + 1 * this.rad * Math.sin(this.th - this.phi),
        // )
        // ctx.stroke();


        // centre to pen
        ctx.beginPath();
        ctx.strokeStyle = transCol
        ctx.moveTo(this.x0, this.y0);
        ctx.lineTo(
            this.x0 + this.radCont * Math.cos(this.th + this.drawAng) * this.rat,
            this.y0 + this.radCont * Math.sin(this.th + this.drawAng) * this.rat
        )
        ctx.stroke();

        // pen point
        ctx.beginPath();
        ctx.fillStyle = pair.color;
        ctx.arc(
            this.x0 + this.radCont * Math.cos(this.th + this.drawAng) * this.rat,
            this.y0 + this.radCont * Math.sin(this.th + this.drawAng) * this.rat,
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
        // let phi = this.phi;
        let A = this.drArc;
        // let cosalphr = Math.cos((PI2 / 2) - tha);
        // let rArc = A * cosalphr + Math.sqrt(0.5 * A * cosalphr ** 2 - 
        //(A ** 2 - this.arcRat ** 2 * this.rad ** 2));
        let rArc = A * Math.cos(PI2 / 2 - tha) + Math.sqrt((this.rad) ** 2 -
            A ** 2 * Math.sin(PI2 / 2 - tha) ** 2)
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
    constructor(fixed, moving, previewState) {
        this.fixed = fixed;
        this.moving = moving;
        this.out = false;
        this.th = 0;
        this.auto = 0;
        this.hue = hueInit;
        this.saturation = 100;
        this.lightness = 65;
        this.locked = true;
        this.showPreview = previewState;
        this.setColor();
        this.trace = new Trace(this, 1);
        this.previewTrace;
        this.traces = [];


        this.updateMovingShape();
        this.updatePairGeom();
        this.move(this.th);
        this.tracing = true;
    }
    updateMovingShape() {
        // updates only moving shape but requires knowledge of fixed shape size 
        // in the case that the arc sizes is greater than fixed size to determine effective perimeter
        // called after changes to nArc, perimTeeth, arcness
        let m = this.moving;
        let f = this.fixed;
        //if inverted oversize arcShape, reduce size to fit inside.
        !this.out & m.nArc > 1 & m.perimTeeth >= f.teeth ?
            m.perimTeeth = f.teeth - 1 : 0;

        let fixedRad = f.teeth * pixPerTooth / PI2;
        m.perim = m.perimTeeth * pixPerTooth;

        if (m.nArc == 1) {
            //special case for n=1, non-zero arcness is impossible
            m.circ = m.perimTeeth * pixPerTooth;
            m.rad = m.circ / PI2
            m.theta = PI2;
            m.phi = PI2;
            m.arcRat = Math.sin(m.theta) / Math.sin(m.phi);
            m.radCont = m.rad / m.arcRat;//radius of containing circle
            //dist from geo centre to arc centre
            m.drArc = m.rad * (Math.cos(m.phi) - Math.cos(m.theta) / m.arcRat);
            m.teeth=m.perimTeeth

        }
        else { // first get teeth

            m.theta = PI2 / 2 / m.nArc; // half angle from geo centre to arc intersect points
            m.phi = Math.acos(m.arcness * (maxArcness - Math.cos(m.theta)) +
                Math.cos(m.theta));
            m.rad = m.perim / (2 * m.phi * m.nArc);
            m.circ = PI2 * m.rad;
            m.teeth = m.circ / pixPerTooth;
            if (m.teeth >= f.teeth & !this.out) {
                //only pivoting - phi still determined by arcness but radCont determined by 
                // 'effective perimeter' as not rolling
                m.radCont = fixedRad * Math.sin(m.perim / (2 * fixedRad * m.nArc)) /
                    Math.sin(m.theta);
                m.arcRat = Math.sin(m.theta) / Math.sin(m.phi);
                m.rad = m.radCont * m.arcRat;
                m.circ = PI2 * m.rad;
                m.teeth = m.circ / pixPerTooth;
                //dist from geo centre to arc centre
                m.drArc = m.rad * (Math.cos(m.phi) - Math.cos(m.theta) / m.arcRat);
            }
            else {
                //rolling+pivoting
                m.arcRat = Math.sin(m.theta) / Math.sin(m.phi);
                m.radCont = m.rad / m.arcRat;//radius of containing circle
                //dist from geo centre to arc centre
                m.drArc = m.rad * (Math.cos(m.phi) - Math.cos(m.theta) / m.arcRat);

            }
        }
        // console.log(m)
    }
    updatePairGeom() {
        let m = this.moving;
        let f = this.fixed;
        this.configRings();
        // roll required to complete
        this.fullTraceTh = PI2 * calcLCM(this.fixed.teeth, this.moving.perimTeeth) /
            this.fixed.teeth;
        // this.arcness = (m.teeth - m.perimTeeth) / (f.teeth - m.perimTeeth); 
        // 0: circle, 1: arcRad = Fixed Rad

        if (!this.out) {
            //in
            if (m.teeth < f.teeth | m.nArc == 1) {
                this.tha_pp = (m.phi * m.rad / f.rad) //first pivot switch point (when tha is at pivot angle)
                //angle to geocentre (thg) at which tha_pp occurs
                this.thg_pp = m.phi * m.rad / f.rad - Math.asin(m.drArc * Math.sin(m.phi) /
                    ((f.rad - m.rad) ** 2 + m.drArc ** 2 + 2 * m.drArc *
                        (f.rad - m.rad) * Math.cos(m.phi)) ** 0.5)
            }
            else {
                // console.log('only pivot')
                this.tha_pp = Math.asin(Math.sin(m.theta) * m.radCont / f.rad);
                this.thg_pp = 0;
            }
        }
        else {
            //out (inverted)
            this.tha_pp = (m.phi * m.rad / f.rad)
            this.thg_pp = m.phi * m.rad / f.rad - Math.asin(m.drArc * Math.sin(m.phi) /
                ((f.rad + m.rad) ** 2 + m.drArc ** 2 - 2 * m.drArc * (f.rad + m.rad) *
                    Math.cos(m.phi)) ** 0.5)

        }

        // new method of calculating g to a ratio based on ratio of first pivot point, 
        // now no need for constant gradiant from zero approach
        this.g2a = this.tha_pp / this.thg_pp

        //updateGeoCentre
        m.x0 = m.x + m.drArc * Math.cos(m.th + m.n * 2 * m.theta);
        m.y0 = m.y + m.drArc * Math.sin(m.th + m.n * 2 * m.theta);
        if (this.showPreview) {
            this.calcPreview();
        }
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
            pair.calcPreview();
            // this.auto=auto
        }
    }
    setColor() {
        this.color = "hsl(" + this.hue + "," + this.saturation + "%," + this.lightness + "%)"
        this.transCol = "hsla(" + this.hue + "," + this.saturation + "%," + this.lightness + "%, 0.3)"
    }
    drawRadInfo() {
        let Y0 = Y - uiHeight - txtSize * 1.5
        let X0 = 2 * txtSize
        let X1 = X - 2 * txtSize

        ctx.strokeStyle = this.fixed.color;
        ctx.fillStyle = this.fixed.color;
        ctx.textAlign = "center";
        ctx.font = txtSize / 2 + 'px sans-serif';
        ctx.textBaseline = "middle";
        ctx.fillText(Math.round(this.moving.rat * 100) + "%", X0, Y0 + 0.7 * txtSize);
        ctx.font = txtSize / 4 + 'px sans-serif';
        ctx.fillText('Pen Radius', X0, Y0);

        ctx.font = txtSize / 2 + 'px sans-serif';
        ctx.fillText(Math.round(this.moving.drawAng * rad2deg), X1, Y0 + 0.7 * txtSize);
        ctx.font = txtSize / 4 + 'px sans-serif';
        ctx.fillText('Pen Angle', X1, Y0);

    }
    drawArcInfo() {
        let Y0 = Y - uiHeight - txtSize * 1.5
        let X0 = 2 * txtSize
        let X1 = X - 2 * txtSize

        ctx.strokeStyle = this.fixed.color;
        ctx.fillStyle = this.fixed.color;
        ctx.textAlign = "center";
        ctx.font = txtSize / 2 + 'px sans-serif';
        ctx.textBaseline = "middle";
        ctx.fillText(this.moving.nArc, X1, Y0 + txtSize * 0.7);
        ctx.font = txtSize / 4 + 'px sans-serif';
        ctx.fillText('N Sides', X1, Y0);

        ctx.font = txtSize / 2 + 'px sans-serif';
        ctx.textBaseline = "middle";
        // let arcFrac=1+Math.log(this.moving.teeth/this.fixed.teeth);
        let arcFrac = Math.log((this.moving.teeth - this.moving.perimTeeth) * (Math.exp(1) - 1) / (this.fixed.teeth - this.moving.perimTeeth) + 1);
        ctx.fillText((arcFrac * 100).toFixed(0) + "%", X0, Y0 + txtSize * .7);
        // ctx.fillText((this.moving.arcness * 100).toFixed(0) + "%", X0, Y0 + txtSize * .7);
        ctx.font = txtSize / 4 + 'px sans-serif';
        ctx.fillText('Arcness', X0, Y0);

    }
    drawColInfo() {
        let Y0 = Y - uiHeight - txtSize * 1.5
        let X0 = 2 * txtSize
        let X1 = X - 2 * txtSize

        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.textAlign = "center";
        ctx.font = txtSize / 2 + 'px sans-serif';
        ctx.textBaseline = "middle";
        ctx.fillText(Math.round(this.hue), X0, Y0 + 0.7 * txtSize);
        ctx.fillText(Math.round(this.lightness - 50), X / 2, Y0 + 0.7 * txtSize);
        ctx.fillText(Math.round(this.saturation), X1, Y0 + 0.7 * txtSize);

        ctx.font = txtSize / 4 + 'px sans-serif';
        ctx.fillText('Hue', X0, Y0);
        ctx.fillText('Lightness', X / 2, Y0);
        ctx.fillText('Saturation', X1, Y0);


    }
    drawInfo() {
        let Y0 = Y - uiHeight - txtSize * 1.5
        let X0 = 2 * txtSize
        let X1 = X - 2 * txtSize

        ctx.strokeStyle = this.fixed.color;
        ctx.fillStyle = this.fixed.color;
        ctx.textAlign = "center";
        ctx.font = txtSize / 2 + 'px sans-serif';
        ctx.textBaseline = "middle";
        ctx.fillText(this.fixed.teeth, X0, Y0 - txtSize * 0.45);
        ctx.fillText(this.moving.perimTeeth, X0, Y0 + txtSize * 0.60);
        ctx.fillText(calcLCM(this.fixed.teeth, this.moving.perimTeeth) /
            this.moving.perimTeeth, X1, Y0 + txtSize * 0.6);

        ctx.beginPath();
        ctx.moveTo(X0 - txtSize * 1.0, Y0 - txtSize * 0.00);
        ctx.lineTo(X0 + txtSize * 1.0, Y0 - txtSize * 0.00);
        ctx.lineWidth = 3 * pixRat;
        ctx.stroke();

        ctx.font = txtSize / 4 + 'px sans-serif';
        ctx.fillText('Fixed wheel', X0, Y0 - txtSize * 1.1);
        ctx.fillText('Moving wheel', X0, Y0 + txtSize * 1.1);
        ctx.fillText('Symmetry', X1, Y0 - txtSize * 0.1);
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
        this.roll(this.th + .1 *
            Math.max(Math.abs(this.moving.perim / this.fixed.circ)) * this.auto);
        // this.roll(this.th + .05 / Math.max(Math.abs(1 - this.fixed.circ / this.moving.perim), .15)
        // * this.auto);
    }
    nudge(n) {
        this.penUp()
        let thInc = -n * PI2 / this.fixed.teeth;
        // if (!this.out) {
        this.moving.th0 += thInc;// * this.fixed.rad / this.moving.rad;
        // }
        // if (this.out) {
        // this.moving.th0 -= thInc * this.fixed.rad / this.moving.rad;
        // }
        this.move(this.th + thInc);
        this.penDown()
        if (this.showPreview) {
            this.calcPreview();
        }
    }
    reset() {
        this.penUp()
        this.moving.th0 = 0;
        this.move(0);
        this.penDown()
    }
    move(th, skipCrossCheck = false, preview = false) {
        if (!skipCrossCheck) {
            this.checkRollCentreCross(th, preview);
        }
        if (th == 0) {
            th = 1e-5; // some glitches around pivot/roll selection at th==0
        }
        let rad2deg = 180 / Math.PI;
        let f = this.fixed;
        let m = this.moving;
        let thg = th - m.th0; //angle to geocentre of arcshape (minis nudge offset)

        this.b = m.radCont; // radius of arcShape containing circle
        let alpha = this.thg_pp; // angle to geocentre of first transition to pivoting;
        let beta = this.tha_pp; // angle to first pivot point
        let thg_delta = thg % (2 * beta); //angle relative to last roll centre (first roll centre at 0)
        //number of roll centres passed
        let n = thg > 0 ? Math.floor(thg / (2 * beta)) : Math.ceil(thg / (2 * beta));
        let nPiv = n - (thg <= 0); // pivot centre number
        let nRoll = n + Math.sign(thg) * (Math.abs(thg_delta) > beta);// roll centre number

        this.nRoll = nRoll;
        let nSide = (nRoll) % m.nArc; //side number rolling;
        let thPP; //current pivot point angle
        if (thg <= 0) {
            thPP = beta + 2 * beta * (n - 1);
        }
        else {
            thPP = beta + 2 * beta * n;
        }
        this.thPP = thPP;
        let th_piv = thPP - thg; //angle relative to current pivot point
        let th_rollcentre = nRoll * 2 * beta; //current roll centre angle
        //angle to centre of current rolling arc from current roll centre 
        let tha_roll = (thg - th_rollcentre) * this.g2a;
        m.n = nSide;
        this.gamma = this.sigma = Math.asin(m.radCont * Math.sin())

        if ((Math.abs(thg_delta) < alpha) | (Math.abs(thg_delta) >= (2 * beta - alpha))) {
            //rolling
            if (this.out) {
                //set current arc centre and shape rotation
                m.x = f.x + (f.rad + m.rad) * Math.cos(m.th0 + th_rollcentre + tha_roll);
                m.y = f.y + (f.rad + m.rad) * Math.sin(m.th0 + th_rollcentre + tha_roll);
                m.th = m.th0 + (nSide * PI2 / m.nArc) + th_rollcentre +
                    tha_roll * (f.rad / m.rad + 1) + PI2 / 2;
                //updateGeoCentre
                m.x0 = m.x + m.drArc * Math.cos(m.th + (m.nArc - nSide) * 2 * m.theta);
                m.y0 = m.y + m.drArc * Math.sin(m.th + (m.nArc - nSide) * 2 * m.theta);
            }
            if (!this.out) {
                //set current arc centre and shape rotation
                m.x = f.x + (f.rad - m.rad) * Math.cos(m.th0 + th_rollcentre + tha_roll);
                m.y = f.y + (f.rad - m.rad) * Math.sin(m.th0 + th_rollcentre + tha_roll);
                m.th = m.th0 - (nSide * PI2 / m.nArc) + th_rollcentre - tha_roll * (f.rad / m.rad - 1);
                //updateGeoCentre
                m.x0 = m.x + m.drArc * Math.cos(m.th + nSide * 2 * m.theta);
                m.y0 = m.y + m.drArc * Math.sin(m.th + nSide * 2 * m.theta);
            }
        }
        else {
            //pivoting, set geo centre directly
            if (!this.out) {

                this.ohm = Math.PI - Math.asin(f.rad / this.b * Math.sin(th_piv))
                this.omg = Math.PI - this.ohm - th_piv
                this.c = ((f.rad - this.b * Math.cos(this.omg)) ** 2 +
                    (this.b * Math.sin(this.omg)) ** 2) ** 0.5
                this.gam = nPiv * 2 * Math.PI / m.nArc - thPP - this.omg + Math.PI / m.nArc;
                m.x0 = f.x + this.c * Math.cos(m.th0 + thg);
                m.y0 = f.y + this.c * Math.sin(m.th0 + thg);
                m.th = m.th0 - this.gam
                //updateRollCentre (not required, for sketching only)
                m.x = m.x0 - m.drArc * Math.cos(m.th + nSide * 2 * m.theta);
                m.y = m.y0 - m.drArc * Math.sin(m.th + nSide * 2 * m.theta);
            }
            if (this.out) {
                //inverted
                this.ohm = Math.asin(f.rad / this.b * Math.sin(th_piv))
                this.omg = Math.PI - this.ohm - th_piv
                this.c = ((f.rad - this.b * Math.cos(this.omg)) ** 2 +
                    (this.b * Math.sin(this.omg)) ** 2) ** 0.5
                this.gam = (m.nArc - nPiv) * 2 * Math.PI / m.nArc -
                    thPP - this.omg - 1 * Math.PI / m.nArc;
                m.x0 = f.x + this.c * Math.cos(m.th0 + thg);
                m.y0 = f.y + this.c * Math.sin(m.th0 + thg);
                m.th = m.th0 - this.gam;

                //updateRollCentre (not required, for sketching only)
                m.x = m.x0 - m.drArc * Math.cos(m.th + (m.nArc - nSide) * 2 * m.theta);
                m.y = m.y0 - m.drArc * Math.sin(m.th + (m.nArc - nSide) * 2 * m.theta);
            }

            // console.log('pivoting nPiv:', nPiv, '\nn:', nSide, '\nth:', th * rad2deg,'\nm.th:',
            // m.th*rad2deg,'\nc:',this.c,
            // '\nohm',this.ohm,'\nomg:',this.omg,
            //     '\nsin(ohm)', Math.sin(this.ohm), '\nsin(omg):', Math.sin(this.omg), 
            //'\nth_piv:', th_piv, '\nasinarg:', f.rad / this.b * Math.sin(th_piv))
            // console.log((m.nArc - nPiv) * 2 * Math.PI / m.nArc)
        }

        this.th = th;
        if (this.tracing & !preview) {
            this.trace.points.push(this.tracePoint());
        }
        if (preview) {
            // console.log(this.previewTrace)
            this.previewTrace.points.push(this.tracePoint());
        }
        // console.log('r', m.rad, '\nR', f.rad, '\na', m.drArc, '\nb', this.b, '\nc', this.c,
        // '\nthapp', this.tha_pp * 57, '\nthg', thg * 57, '\nth_d', this.th_d * 57,
        // '\nohm', this.ohm * 57, '\nomg', this.omg * 57, '\ngam', this.gam * 57)
        // console.log(this)

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
        this.updateMovingShape();
        this.updatePairGeom();
        this.move(pair.th);
        this.penDown();
    }
    configRings() {
        if (this.out) {
            this.fixed.ring = -1;
            this.moving.ring = 0;
        }
        else if (this.moving.perimTeeth > this.fixed.teeth) {
            this.moving.ring = 1;
            this.fixed.ring = 0;
        }
        else {
            this.moving.ring = 0;
            this.fixed.ring = 1;
        }
    }
    checkRollCentreCross(th, preview) {

        let m = this.moving;
        let thg = th - m.th0;
        let beta = this.tha_pp;
        // let thg_delta = thg % (2 * beta);
        let n = parseInt(thg / (2 * beta));
        let thPP = beta + 2 * beta * n
        if (thg < 0) {
            thPP = beta + 2 * beta * (n - 1);
        }
        //check if local pivot point has changed since last move
        if (thPP != this.thPP) {
            //if so move to roll centre
            // console.log("Roll cross:", this.nRoll)
            this.move(this.nRoll * 2 * beta + 1e-10 + m.th0, true, preview)
        }

    }
    roll(th, preview = false) {
        this.move(this.th, false, preview)
        if (Math.abs(th - this.th) < dth) {
            // normal move, increment is safely small
            this.move(th, false, preview)
        }
        else {
            // move in units of dth
            let n = (th - this.th) / dth;
            // console.log(n);

            if (n > 0) {
                for (let i = 1; i < (n); i++) {
                    this.move(this.th + dth, false, preview);
                    // console.log(i);
                }
                this.move(this.th + (n - Math.floor(n)) * dth, false, preview);
            }
            else {
                for (let i = 1; i < -(n); i++) {
                    this.move(this.th - dth, false, preview);
                }
                this.move(this.th - (Math.ceil(n) - n) * dth, false, preview);
            }
        }
    }
    fullTrace() {
        this.penUp();
        this.penDown();
        let startTh = this.th;
        this.roll(this.th + this.fullTraceTh);
        this.move(startTh + this.fullTraceTh);
        this.penUp();
        this.penDown();
    }
    togglePreview() {
        this.calcPreview();
        this.showPreview = !this.showPreview;
        previewState = this.showPreview;
    }
    calcPreview() {
        this.previewTrace = new Trace(this, previewAlpha)
        this.previewTrace.points = [];
        let startTh = this.th;

        this.move(0, true, true);
        this.roll(this.fullTraceTh, true);
        // this.move(this.fullTraceTh, true, true);

        this.penUp();
        this.move(startTh, true, false)
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
        let x = m.x0 + Math.cos(m.th + m.drawAng) * (m.radCont * m.rat)
        let y = m.y0 + Math.sin(m.th + m.drawAng) * (m.radCont * m.rat)
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
    constructor(panel, x, y, w, h, txt, fun, argObj, getXdragVar, getYdragVar,
        isDepressedFun, toggleValFun) {
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
            ctx.fillText(this.txt[0],
                this.x + this.w / 2, this.y + this.h / 2 - .6 * txtSize / 4, this.w * 0.9);
            ctx.fillText(this.txt[1],
                this.x + this.w / 2, this.y + this.h / 2 + .6 * txtSize / 4, this.w * 0.9);
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

    if (!pair.auto & showWheels & pair.moving.contains(xt, yt) &
        ((y < (Y - uiHeight) & orient == "wideandtall") ||
            ((y < (Y - uiHeight)) & (y > (uiHeight)) & orient == "tallorsquare") ||
            ((y > 0 & x > uiButtonsWidth) & orient == "wideandshort"))
    ) {
        mselect = "moving";
        thDragSt = Math.atan2(yt - pair.fixed.y, xt - pair.fixed.x);
    }
    else if (showWheels & pair.fixed.contains(xt, yt) &
        ((y < (Y - uiHeight) & orient == "wideandtall") ||
            ((y < (Y - uiHeight)) & (y > (uiHeight)) & orient == "tallorsquare") ||
            ((y > 0 & x > uiButtonsWidth) & orient == "wideandshort"))) {
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
    // if (!showWheels) {
    //     showWheels = true;
    // }
    else {
        topPanel.active = true;
        bottomPanel.active = true;
        colourPanel.active = true;
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
function calcLCM(a, b) {
    //lowest common multiple
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

    let panel = new Panel(uiButtonsX + uiBorder, uiButtonsY + uiBorder, uiButtonsWidth -
        2 * uiBorder, uiHeight - 2 * uiBorder);
    panel.anyClickActivates = true;

    panel.buttonArray.push(
        new PButton(panel, 0.0, 0.0, 0.25, 0.333, ["Share"],
            function () { sharePanel.active = true; })
    );
    panel.buttonArray.push(
        new PButton(panel, 0.0, 0.333, 0.125, 0.333, ["Hide", "UI"],
            function () {
                // showUI = false;
                // showWheels = false;
                panelArray.forEach(panel => panel.active = false)
            })
    );
    let hideDiscsButton = new PButton(panel, 0.125, 0.333, 0.125, 0.333, ["Hide", "Discs"],
        function () {
            // showUI = false;
            showWheels = !showWheels;
            // panelArray.forEach(panel => panel.active = false)
        },
        [], [], [], null,
        function () { return !showWheels; })
    hideDiscsButton.toggle = true;
    panel.buttonArray.push(hideDiscsButton);

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



    let invertButton = new PButton(panel, 0.5, 0, 0.125, 0.333, ["Invert"],
        function () { pair.inOut(); },
        [], [], [], null,
        function () { return pair.out; });
    invertButton.toggle = true;
    panel.buttonArray.push(invertButton);


    panel.buttonArray.push(
        new PButton(panel, 0.5, .333, 0.25, 0.333, ["Nudge +"],
            function () { return pair.nudge(1); })
    );
    panel.buttonArray.push(
        new PButton(panel, 0.5, .666, 0.25, 0.333, ["Nudge -"],
            function () { return pair.nudge(-1); })
    );

    panel.buttonArray.push(
        new PButton(panel, 0.625, 0, 0.125, 0.333, ["Reset"],
            function () { return pair.reset(); })
    );

    let lockButton = new PButton(panel, 0.875, 0, 0.125, 0.333, ["Lock", "Ring"],
        function () { return pair.toggleLock(); },
        [], [], [], null,
        function () { return pair.locked; })
    lockButton.toggle = true;
    panel.buttonArray.push(lockButton);

    let previewButton = new PButton(panel, 0.750, 0, 0.125, 0.333, ["Preview"],
        function () { return pair.togglePreview(); },
        [], [], [], null,
        function () { return pair.showPreview; })
    previewButton.toggle = true;
    panel.buttonArray.push(previewButton);


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
    let panel = new Panel(uiSlidersX + uiBorder, uiSlidersY + uiBorder, uiSlidersWidth -
        2 * uiBorder, uiHeight - 2 * uiBorder);
    panel.anyClickActivates = true;

    let fixRadButton = new PButton(panel, 0 / 6, 0, 1 / 6, 1, ["Fixed", "Size"],
        function (dy, yDragVar0) {
            // showWheelsOverride = true;
            pair.penUp();
            pair.fixed.teeth = Math.round(Math.min(maxWheelSize,
                Math.max(-0.1 / pixRat * dy + yDragVar0, 20)));
            if (pair.fixed.teeth == pair.moving.perimTeeth) {
                pair.fixed.teeth--;
            }

            pair.configRings();
            pair.fixed.circ = pair.fixed.teeth * pixPerTooth;
            pair.fixed.rad = pair.fixed.circ / PI2
            !pair.out & pair.moving.nArc > 1 & pair.moving.perimTeeth >= pair.fixed.teeth ?
                pair.moving.perimTeeth = pair.fixed.teeth - 1 : 0;
            pair.updateMovingShape()
            pair.updatePairGeom();
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

    let perimTeethButton = new PButton(panel, 1 / 6, 0, 1 / 6, 1, ["Moving", "Size"],
        function (dy, yDragVar0) {
            // showWheelsOverride = true;
            pair.penUp();
            // pair.moving.perimTeeth = Math.round(Math.min(pair.fixed.teeth - 1, 
            //Math.max(-0.05 / pixRat * dy + yDragVar0, 10)))
            !pair.out & pair.moving.nArc > 1 ?
                maxPerimTeeth = Math.min(maxWheelSize, pair.fixed.teeth - 1) : maxPerimTeeth = maxWheelSize;
            pair.moving.perimTeeth = Math.round(Math.min(maxPerimTeeth,
                Math.max(-0.05 / pixRat * dy + yDragVar0, 10)))
            //need to use same definition of arcness to define moving.teeth, 
            // as using in pair.updatePairGeom()
            // pair.moving.teeth = pair.arcness * (pair.fixed.teeth - pair.moving.perimTeeth) 
            // + pair.moving.perimTeeth
            // pair.configRings();
            if (pair.fixed.teeth == pair.moving.perimTeeth) {
                pair.moving.perimTeeth++;
            }
            pair.updateMovingShape();
            pair.updatePairGeom();
            pair.move(pair.th);
            pair.penDown();

        }, [], [],
        function () {
            return pair.moving.perimTeeth;
        },
        function (isDepressed) {
            // showArcInfo = isDepressed;
            showInfo = isDepressed;
        },
    )
    perimTeethButton.yDrag = true;
    perimTeethButton.UDarrows = true;
    panel.buttonArray.push(perimTeethButton)


    let movRadButton = new PButton(panel, 2 / 6, 0, 1 / 6, 1, ["Arcness"],
        function (dy, yDragVar0) {
            // showWheelsOverride = true;
            pair.penUp();
            if (pair.moving.nArc>1){
            pair.moving.arcness = Math.min(1, Math.max(-0.005 / pixRat * dy + yDragVar0, 0));

            pair.configRings();
            pair.updateMovingShape();
            pair.updatePairGeom();
            pair.move(pair.th);
            pair.penDown();}

        }, [], [],
        function () {
            return pair.moving.arcness;
        },
        function (isDepressed) {
            showArcInfo = isDepressed;
        }
    )
    movRadButton.yDrag = true;
    movRadButton.UDarrows = true;
    panel.buttonArray.push(movRadButton)

    let nArcButton = new PButton(panel, 3 / 6, 0, 1 / 6, 1, ["# Sides"],
        function (dy, yDragVar0) {

            // showWheelsOverride = true;
            pair.penUp();
            pair.moving.nArc = Math.round(Math.min(7, Math.max(-0.05 / pixRat * dy + yDragVar0, 1)));
            // if (pair.moving.teeth == pair.fixed.teeth) {
            //     pair.moving.teeth--;
            // }
            pair.updateMovingShape();
            pair.updatePairGeom();
            pair.configRings();

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
    nArcButton.yDrag = true;
    nArcButton.UDarrows = true;
    panel.buttonArray.push(nArcButton)

    let ratButton = new PButton(panel, 4 / 6, 0, 1 / 6, 1, ["Pen", "Radius"],
        function (dy, yDragVar0) {
            // showWheelsOverride = true;
            pair.penUp();
            pair.moving.rat = Math.min(maxDrawRadiusRatio, Math.max(-0.002 / pixRat * dy + yDragVar0, 0))
            pair.penDown();
            pair.calcPreview();

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
            // showWheelsOverride = true;
            pair.penUp();
            pair.moving.drawAng =
                Math.min(100 * PI2, Math.max(-0.005 / pixRat * dy + yDragVar0, -100 * PI2));
            if (pair.moving.drawAng < -PI2 / 2) {
                pair.moving.drawAng = pair.moving.drawAng + PI2;
            }
            if (pair.moving.drawAng > PI2 / 2) {
                pair.moving.drawAng = pair.moving.drawAng - PI2;
            }
            pair.penDown();
            pair.calcPreview();

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
function createColourPanel() {
    let nButs = 3;

    let panel = new Panel(uiShapeX + uiBorder, uiShapeY + uiBorder, uiShapeWidth -
        2 * uiBorder, uiHeight - 2 * uiBorder);
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
            pair.calcPreview();

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

            pair.lightness = Math.max(00, Math.min(100, yDragVar0 + dy * -0.15 / pixRat));

            pair.setColor();
            pair.fixed.color = pair.color;
            pair.moving.color = pair.color;
            document.querySelector(':root').style.setProperty('--fgColor', pair.color)
            pair.move(pair.th);
            pair.penDown();
            pair.calcPreview();
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
            pair.calcPreview();

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

    if (pair.showPreview) {
        pair.previewTrace.draw(ctx);
    }


    if (showWheels | showWheelsOverride) {
        pair.fixed.draw();
        pair.moving.draw();
        pair.draw();
    }


    // fixed stuff
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    // // draw trace count
    // ctx.font = txtSize + 'px sans-serif';
    // ctx.fillText(pair.traces.length, 100, 500,)

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
    colourPanel = createColourPanel();
    panelArray = [topPanel, bottomPanel, colourPanel, sharePanel];
}
function init() {
    hueInit = Math.random() * 360
    bgFillStyle = "hsl(" + hueInit + ",100%,5%)";
    bgFillStyleAlpha = "hsla(" + hueInit + ",100%,5%,.7)"
    fgFillStyle = "hsl(" + hueInit + ",100%,50%)"
    setGallerySubmitHTML();
    canvas.style.backgroundColor = bgFillStyle
    let perimTeethInit = discSizes.random();
    let fixedTeeth = ringSizes.random()
    let arcnessInit = Math.random() * 0.6
    let nArcInit = (Math.random() < 0.5) ? 1 : 2 + Math.floor(Math.random() * 3);
    let ratInit = Math.random() * 0.5 + 0.5;
    let penAngleInit = (Math.random() < 0.5) ?
        (Math.random() < 0.5 ? 0 : 0.5 * PI2 / nArcInit) : Math.random() * PI2 - PI2 / 2;
    let fixedDisc = new Disc(fixedTeeth);
    let movingDisc = new ArcSidedDisc(perimTeeth = perimTeethInit, arcness = arcnessInit,
        rat = ratInit, nArc = nArcInit, penAngle = penAngleInit, ring = false)

    // let fixedDisc = new Disc(106);
    // let movingDisc = new ArcSidedDisc(perimTeeth = 60, arcness = .17, rat = .8, nArc = 2, 
    //penAngle = 0*PI2/4, ring = false)

    pair = new Pair(fixedDisc, movingDisc, preview = previewState)
    // pair.togglePreview();
    // pair.inOut();
    // pair.moving.nSide=2;
    // pair.updateMovingShape();
    // pair.updatePairGeom();
    // pair.fullTrace();
    // pair.nudge(1);
    // pair.fullTrace();
    // pair.nudge(1);
    // pair.fullTrace();

    // pair.reset();
    // pair.inOut();

    // pair.fullTrace();
    // pair.nudge(1);
    // pair.fullTrace();
    // pair.nudge(1);
    // pair.fullTrace();

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
let previewState = false;

const shareBorderfrac = 0.15;
const transCol = "rgb(128,128,128,0.3)"
const previewAlpha = 0.5
const wheelColor = "white"
const uiTextColor = "white"
const maxWheelSize = 300;
const minWheelSize = 10;
const maxDrawRadiusRatio = 2;
const maxArcness = 0.99;

const galleryLW = 1;
const galleryRes = 1920;
const shareRes = 1920;


const dth = PI2 / 360; // PI2/200 default

//vars for pinch zoom handling
var prevDiff = 0;
var curDiff = 0;
var dDiff = 0;

ringSizes = [96, 105]//,144,150]
discSizes = [24, 30, 32, 40, 42, 45, 48, 52, 56, 60, 63, 72, 75, 80, 84]


let fgFillStyle, bgFillStyleAlpha, bgFillStyle, hueInit, pair, uiSlidersX, uiSlidersY,
    uiSlidersWidth, pixRat, X, Y, scl, txtSize, baseLW, pixPerTooth, xOff, yOff,
    uiButtonsX, uiButtonsY, uiButtonsWidth, uiShapeX, uiShapeY, uiShapeWidth;
setSize();

wakeGalleryServer()
addPointerListeners();

init();
anim();



