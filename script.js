var PARTICLE_NUM = 500;
var PARTICLE_BASE_RADIUS = 0.5;
var FL = 500;
var DEFAULT_SPEED = 2;
var BOOST_SPEED = 300;

var canvas;
var canvasWidth, canvasHeight;
var context;
var centerX, centerY;
var mouseX, mouseY;
var speed = DEFAULT_SPEED;
var targetSpeed = DEFAULT_SPEED;
var particles = [];
var lastColorChangeTime = 0;
var lastBackgroundChangeTime = 0;
var backgroundColor = getRandomGrayColor();
var targetBackgroundColor = getRandomGrayColor();
var backgroundColorTransitionDuration = 2000;
var backgroundColorTransitionStartTime = 0;

window.addEventListener('load', function() {
    canvas = document.getElementById('c');
    
    var resize = function() {
        canvasWidth  = canvas.width = window.innerWidth;
        canvasHeight = canvas.height = window.innerHeight;
        centerX = canvasWidth * 0.5;
        centerY = canvasHeight * 0.5;
        context = canvas.getContext('2d');
    };

    document.addEventListener('resize', resize);
    resize();
    
    mouseX = centerX;
    mouseY = centerY;
    
    for (var i = 0, p; i < PARTICLE_NUM; i++) {
        particles[i] = randomizeParticle(new Particle());
        particles[i].z -= 500 * Math.random();
        particles[i].color = getRandomColor(); // Set a random color for each particle
    }
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, false);
    
    document.addEventListener('mousedown', function(e) {
        targetSpeed = BOOST_SPEED;
    }, false);
    
    document.addEventListener('mouseup', function(d) {
        targetSpeed = DEFAULT_SPEED;
    }, false);

    // Initialize the color at the beginning
    context.fillStyle = backgroundColor;
    
    setInterval(loop, 1000 / 60);
}, false);

function loop() {
    context.save();
    
    if (backgroundColorTransitionStartTime > 0) {
        var currentTime = Date.now();
        var deltaTime = currentTime - backgroundColorTransitionStartTime;
        
        if (deltaTime >= backgroundColorTransitionDuration) {
            backgroundColor = targetBackgroundColor;
            backgroundColorTransitionStartTime = 0;
        } else {
            var progress = deltaTime / backgroundColorTransitionDuration;
            var r = Math.floor(lerpColorComponent(getColorComponent(backgroundColor, 'r'), getColorComponent(targetBackgroundColor, 'r'), progress));
            var g = Math.floor(lerpColorComponent(getColorComponent(backgroundColor, 'g'), getColorComponent(targetBackgroundColor, 'g'), progress));
            var b = Math.floor(lerpColorComponent(getColorComponent(backgroundColor, 'b'), getColorComponent(targetBackgroundColor, 'b'), progress));
            backgroundColor = 'rgb(' + r + ', ' + g + ', ' + b + ')';
        }
    }
    
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.restore();

    speed += (targetSpeed - speed) * 0.01;

    var p;
    var cx, cy;
    var rx, ry;
    var f, x, y, r;
    var pf, px, py, pr;
    var a, a1, a2;
    
    var halfPi = Math.PI * 0.5;
    var atan2  = Math.atan2;
    var cos    = Math.cos;
    var sin    = Math.sin;
    
    context.beginPath();
    for (var i = 0; i < PARTICLE_NUM; i++) {
        p = particles[i];
        
        p.pastZ = p.z;
        p.z -= speed;
        
        if (p.z <= 0) {
            randomizeParticle(p);
            p.color = getRandomColor(); // Set a new random color for the particle
            continue;
        }
        
        cx = centerX - (mouseX - centerX) * 1.25;
        cy = centerY - (mouseY - centerY) * 1.25;
        
        rx = p.x - cx;
        ry = p.y - cy;
        
        f = FL / p.z;
        x = cx + rx * f;
        y = cy + ry * f;
        r = PARTICLE_BASE_RADIUS * f;
        
        pf = FL / p.pastZ;
        px = cx + rx * pf;
        py = cy + ry * pf;
        pr = PARTICLE_BASE_RADIUS * pf;
        
        a  = atan2(py - y, px - x);
        a1 = a + halfPi;
        a2 = a - halfPi;
        
        context.moveTo(px + pr * cos(a1), py + pr * sin(a1));
        context.arc(px, py, pr, a1, a2, true);
        context.lineTo(x + r * cos(a2), y + r * sin(a2));
        context.arc(x, y, r, a2, a1, true);
        context.closePath();
        
        context.fillStyle = p.color; // Set the particle's color
    }
    context.fill();

    var currentTime = Date.now();
    if (currentTime - lastBackgroundChangeTime >= 5000) {
        targetBackgroundColor = getRandomGrayColor();
        backgroundColorTransitionStartTime = currentTime;
        lastBackgroundChangeTime = currentTime;
    }

    var currentTime = Date.now();
    if (currentTime - lastColorChangeTime >= 1500) {
        context.fillStyle = getRandomGrayColor();
        lastColorChangeTime = currentTime;
    }
}

function randomizeParticle(p) {
    p.x = Math.random() * canvasWidth;
    p.y = Math.random() * canvasHeight;
    p.z = Math.random() * 1500 + 500;
    return p;
}

function getRandomGrayColor() {
    var grayValue = Math.floor(Math.random() * 256);
    return 'rgb(' + grayValue + ', ' + grayValue + ', ' + grayValue + ')';
}

function getRandomColor() {
    var r, g, b;

    do {
        r = Math.floor(Math.random() * 256);
        g = Math.floor(Math.random() * 256);
        b = Math.floor(Math.random() * 256);
    } while (r === 0 && g === 0 && b === 0);

    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

function getColorComponent(color, component) {
    var match = color.match(/\d+/g);
    if (match) {
        if (component === 'r') return parseInt(match[0]);
        if (component === 'g') return parseInt(match[1]);
        if (component === 'b') return parseInt(match[2]);
    }
    return 0;
}

function lerpColorComponent(start, end, t) {
    return start + (end - start) * t;
}

function Particle(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.pastZ = 0;
    this.color = getRandomColor(); // Initialize the particle with a random color
}
