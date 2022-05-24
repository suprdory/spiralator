const canvas = document.getElementById("cw");
const ctx = canvas.getContext("2d");
const PI2 = Math.PI * 2
const cursor = {
    x: innerWidth / 2,
    y: innerHeight / 2,
};
class Ring {
    constructor(
        x = cursor.x,
        y = cursor.y,
        innerCirc = 105,
        outerCirc = 150,
    ) {
        this.x = x;
        this.y = y;
        this.innerCirc = innerCirc;
        this.outerCirc = outerCirc;
        this.innerRad = this.innerCirc / PI2;
        this.outerRad = this.outerCirc / PI2;
        this.color = 'white';
        this.lw = 1;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lw;
        ctx.arc(this.x, this.y, this.innerRad, 0, PI2);
        ctx.arc(this.x, this.y, this.outerRad, 0, PI2);
        ctx.stroke();
    }
}

class Disk {
    constructor(
        x = cursor.x,
        y = cursor.y,
        circ = 80,

    ) {
        this.x = x;
        this.y = y;
        this.circ = circ;
        this.rad = this.circ / PI2;
        this.lw = 1;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lw;
        ctx.arc(this.x, this.y, this.rad, 0, PI2);
        ctx.stroke();
    }
}

disk = new Disk();
// ring = new Ring();

disk.draw();
// ring.draw();