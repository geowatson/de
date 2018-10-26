let graph = document.getElementsByClassName("graph")[0];

let chart, xAxis, yAxis, yExact;
let x0 = 1, x1 = 5, y0 = 0.5, h = 0.01;
let method = "euler";

function f(x, y) {
    return (x ** 3) * (y ** 4)  - y / x;
}

function exact(x) {
    return 1 / x * Math.pow(11 - 3 * x, -1/3);
}

function onDeltaChange(val) {
    h = Number(val);
    redraw();
}

function onMethodChange(val) {
    method = val;
    redraw();
}

function redraw() {
    let N = Math.floor((x1 - x0) / h).toString();
    xAxis = defineX(x0, x1, h);
    yAxis = defineY(f, y0, xAxis, h);
    yExact = xAxis.map(x => exact(x)).filter(Boolean);

    if (yAxis.length > yExact.length) {
        yAxis.splice(yExact.length - 1, yAxis.length - yExact.length);
    }
    else if (yAxis.length < yExact.length) {
        yAxis.splice(yAxis.length - 1, yExact.length - yAxis.length);
    }

    let Numerical = [];
    let Exact = [];
    xAxis.forEach(function(value, index, array) {
        Numerical.push({x: value, y: yAxis[index]});
        Exact.push({x: value, y: yExact[index]});
    });

    chart.data.datasets[0].data = Numerical;
    chart.data.datasets[1].data = Exact;
    document.getElementById("N").innerText = N;
    document.getElementById("h").innerText = h;

    chart.update();
}

function defineX(from, to, delta) {
    let arr = [];
    let count = Math.round((to - from) / delta);

    for (let i = 0; i <= count; ++i) {
        arr.push(from + i * delta);
    }

    return arr;
}

function defineY(funct, y0, xAxis, delta) {
    let arr = [y0];
    let count = Math.round((xAxis[xAxis.length - 1] - xAxis[0]) / delta);

    if (method === "euler") {
        for (let i = 1; i <= count; ++i) {
            arr.push(arr[i - 1] + delta * funct(xAxis[i - 1], arr[i - 1]));
        }
    }
    else if (method === "improvedEuler") {
        for (let i = 1; i <= count; ++i) {
            let k1 = funct(xAxis[i - 1], arr[i - 1]);
            arr.push(arr[i - 1] + delta / 2 * (k1 + funct(xAxis[i - 1], arr[i - 1] + delta * k1)));
        }
    }
    else {
        for (let i = 1; i <= count; ++i) {
            let k1 = funct(xAxis[i - 1], arr[i - 1]);
            let k2 = funct(xAxis[i - 1] + delta / 2, arr[i - 1] + delta / 2 * k1);
            let k3 = funct(xAxis[i - 1] + delta / 2, arr[i - 1] + delta / 2 * k2);
            let k4 = funct(xAxis[i - 1] + delta, arr[i - 1] + delta * k3);
            arr.push(arr[i - 1] + delta / 6 * (k1 + 2 * k2 + 2 * k3 + k4));
        }
    }

    return arr;
}

function init(funct, x0, y0, x1, h) {
    xAxis = defineX(x0, x1, h);
    yAxis = defineY(funct, y0, xAxis, h);
    yExact = xAxis.map(x => exact(x)).filter(Boolean);
    document.getElementById("N").innerText = Math.floor((x1 - x0) / h).toString();
    document.getElementById("h").innerText = h;

    if (yAxis.length > yExact.length) {
        yAxis.splice(yExact.length - 1, yAxis.length - yExact.length);
    }
    else if (yAxis.length < yExact.length) {
        yAxis.splice(yAxis.length - 1, yExact.length - yAxis.length);
    }
    let Numerical = [];
    let Exact = [];
    xAxis.forEach(function(value, index, array) {
        Numerical.push({x: value, y: yAxis[index]});
        Exact.push({x: value, y: yExact[index]});
    });

    // error function
    //
    // yAxis.forEach(function (value, index, array) {
    //     console.log(value - yExact[index]);
    // });

    chart = new Chart(document.getElementById("chart"), {
        type: 'line',
        data: {
            labels: xAxis,
            datasets: [{
                data: Numerical,
                borderColor: "#3e95cd",
                label: "Numerical",
                fill: false,
            }, {
                data: Exact,
                borderColor: "#ff0000",
                label: "Exact",
                fill: false,
            },
            ]
        },
        options: {
            animation: {
                duration: 0,
            },
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: true,
            },
            title: {
                display: false,
                text: 'Interactive editor- solution of y\'=y^4 * x^3 - y / x'
            },
            elements: {
                point: {
                    radius: 0,
                },
                line: {
                    tension: 0,
                }
            },
            scales: {
                xAxes: [{
                    type: "linear",
                    position: "bottom",
                    ticks: {

                    }
                }],
                yAxes: [{
                    type: "linear",
                    ticks: {

                    }
                }]
            }
        },
    });
}

init(f, x0, y0, x1, h);

graph.style.height = (0.89 * window.innerHeight).toString() + "px";

window.onresize = () => {
    graph.style.height = (0.89 * window.innerHeight).toString() + "px";
};

graph.onwheel = (something) => {
    // chart.options.scales.yAxes[0].ticks.min = -1;
    // console.log(chart.options.scales.yAxes[0].ticks.min);
    let yMin = chart.scales["y-axis-0"].min;
    let yMax = chart.scales["y-axis-0"].max;
    let xMin = chart.scales["x-axis-0"].min;
    let xMax = chart.scales["x-axis-0"].max;
    let centerElemY = (chart.chartArea.bottom - chart.chartArea.top) / 2;
    let centerElemX = (chart.chartArea.right - chart.chartArea.left) / 2;
    let cursorDeltaY = 2 * (something.clientY - graph.getBoundingClientRect().top - chart.chartArea.top - centerElemY) / (chart.chartArea.bottom - chart.chartArea.top);
    let cursorDeltaX = 2 * (something.clientX - graph.getBoundingClientRect().left - chart.chartArea.left - centerElemX) / (chart.chartArea.right - chart.chartArea.left);


    let d = something.deltaY;
    let cf = 0.001;
    let topOffset, botOffset, leftOffset, rightOffset;
    let dF, dR;
    if (cursorDeltaY > 0) {
        cursorDeltaY = Math.min(1, cursorDeltaY);
        topOffset = 1 - cursorDeltaY;
        botOffset = cursorDeltaY;
    }
    else {
        cursorDeltaY = -1 * Math.max(-1, cursorDeltaY);
        topOffset = cursorDeltaY;
        botOffset = 1 - cursorDeltaY;
    }
    if (cursorDeltaX > 0) {
        cursorDeltaX = Math.min(1, cursorDeltaX);
        leftOffset = cursorDeltaX;
        rightOffset = 1 - cursorDeltaX;
    }
    else {
        cursorDeltaX = -1 * Math.max(-1, cursorDeltaX);
        leftOffset = 1 - cursorDeltaX;
        rightOffset = cursorDeltaX;
    }
    // console.log(chart.options.scales.yAxes[0].ticks);

    if (chart.options.scales.yAxes[0].ticks.min === undefined) {
        dF = (yMax - yMin);
        dR = (xMax - xMin);
        chart.options.scales.yAxes[0].ticks.min = yMin + cf * d * dF * topOffset;
        chart.options.scales.yAxes[0].ticks.max = yMax - cf * d * dF * botOffset;
        chart.options.scales.xAxes[0].ticks.min = xMin + cf * d * dR * leftOffset;
        chart.options.scales.xAxes[0].ticks.max = xMax - cf * d * dR * rightOffset;
    }
    else {
        dF = (chart.options.scales.yAxes[0].ticks.max - chart.options.scales.yAxes[0].ticks.min);
        dR = (chart.options.scales.xAxes[0].ticks.max - chart.options.scales.xAxes[0].ticks.min);
        let k = (chart.chartArea.bottom - something.clientY) / (chart.chartArea.right - something.clientX);

        chart.options.scales.xAxes[0].ticks.min += cf * d * dR * leftOffset;
        chart.options.scales.xAxes[0].ticks.max -= cf * d * dR * rightOffset;
        chart.options.scales.yAxes[0].ticks.min += cf * d * dF * topOffset;
        chart.options.scales.yAxes[0].ticks.max -= cf * d * dF * botOffset;
    }

    chart.update();

    console.log(cursorDeltaX, cursorDeltaY);
};