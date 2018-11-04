let method = "euler";
let deltas = [0, 11 / 3];
let x0 = 1, x1 = 5, y0 = 0.5, h = 0.01;

let chart, xAxis, yAxis, yExact;
let graph = document.getElementById("chart");

function f(x, y) {
    return y ** 4 * x ** 3 - y / x;
}

function exact(x) {
    return 1 / Math.cbrt(11 * x ** 3 - 3 * x ** 4);
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
    xAxis.forEach(function(value, index) {
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
    let ans;
    let arr = [y0];
    let count = Math.round((xAxis[xAxis.length - 1] - xAxis[0]) / delta);

    if (method === "euler") {
        for (let i = 1; i <= count; ++i) {
            if (Math.abs(xAxis[i - 1] - deltas[1]) <= delta || Math.abs(xAxis[i - 1] - deltas[0]) <= 2 * delta) {
                ans = exact(xAxis[i]);
            } else
                ans = ans = arr[i - 1] + delta * funct(xAxis[i - 1], arr[i - 1]);

            arr.push(ans);
        }
    }
    else if (method === "improvedEuler") {
        for (let i = 1; i <= count; ++i) {
            if (Math.abs(xAxis[i - 1] - deltas[1]) <= delta || Math.abs(xAxis[i - 1] - deltas[0]) <= 2 * delta) {
                ans = exact(xAxis[i]);
            } else {
                let k1 = funct(xAxis[i - 1], arr[i - 1]);
                ans = arr[i - 1] + delta / 2 * (k1 + funct(xAxis[i - 1], arr[i - 1] + delta * k1));
            }

            arr.push(ans);
        }
    }
    else {
        for (let i = 1; i <= count; ++i) {
            if (Math.abs(xAxis[i - 1] - deltas[1]) <= delta || Math.abs(xAxis[i - 1] - deltas[0]) <= 2 * delta) {
                ans = exact(xAxis[i]);
            } else {
                let k1 = funct(xAxis[i - 1], arr[i - 1]);
                let k2 = funct(xAxis[i - 1] + delta / 2, arr[i - 1] + delta / 2 * k1);
                let k3 = funct(xAxis[i - 1] + delta / 2, arr[i - 1] + delta / 2 * k2);
                let k4 = funct(xAxis[i - 1] + delta, arr[i - 1] + delta * k3);
                ans = arr[i - 1] + delta / 6 * (k1 + 2 * k2 + 2 * k3 + k4);
            }

            arr.push(ans);
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

    xAxis.forEach(function(value, index) {
        Numerical.push({x: value, y: yAxis[index]});
        Exact.push({x: value, y: yExact[index]});
    });

    // error function
    //
    // yAxis.forEach(function (value, index, array) {
    //     console.log(value - yExact[index]);
    // });

    chart = initChart(graph, Numerical, Exact);
    chart.options.scales.yAxes[0].ticks.min = -1.5;
    chart.options.scales.yAxes[0].ticks.max = 1.5;
}

function initChart(g, Numerical, Exact) {
    chart = new Chart(g, {
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
                        maxRotation: 0,
                        minRotation: 0
                    }
                }],
                yAxes: [{
                    type: "linear",
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0
                    }
                }]
            }
        },
    });

    g.onwheel = (elem) => {
        // Magical constant
        let k = 1.000004;
        let d = elem.deltaY;
        let width = (chart.chartArea.right - chart.chartArea.left);
        let height = (chart.chartArea.bottom - chart.chartArea.top);

        let newHeightFragment = (1 - 1 / Math.sqrt(k));
        let newWidthFragment = (1 - 1 / Math.sqrt(k));

        let L = newWidthFragment * (elem.clientX - graph.getBoundingClientRect().left - chart.chartArea.left);
        let R = newWidthFragment * width - L;
        let T = newHeightFragment * (elem.clientY - graph.getBoundingClientRect().top - chart.chartArea.top);
        let B = newHeightFragment * height - T;

        rescaleChart(chart, elem, L, R, T, B, d);
    };

    g.onmousedown = (a) => {
        let prevX = a.clientX;
        let prevY = a.clientY;

        g.onmousemove = (elem) => {
            let width = (chart.chartArea.right - chart.chartArea.left);
            let height = (chart.chartArea.bottom - chart.chartArea.top);
            let currX = elem.clientX;
            let currY = elem.clientY;

            let L = (currX - prevX) / width;
            let T = (currY - prevY) / height;

            rescaleChart(chart, elem, -L, L, -T, T);
            prevX = currX;
            prevY = currY;
        };

        g.onmouseup = () => {
            g.onmousemove = null;
        };
    };

    return chart;
}

function rescaleChart(chart, elem, L, R, T, B, d = 1) {

    let dF = 1, dR = 1;
    let yMin = chart.scales["y-axis-0"].min;
    let yMax = chart.scales["y-axis-0"].max;
    let xMin = chart.scales["x-axis-0"].min;
    let xMax = chart.scales["x-axis-0"].max;

    if (chart.options.scales.yAxes[0].ticks.min === undefined || chart.options.scales.xAxes[0].ticks.min === undefined) {
        dF = (yMax - yMin);
        dR = (xMax - xMin);

        chart.options.scales.xAxes[0].ticks.min = xMin + L * dR * d;
        chart.options.scales.xAxes[0].ticks.max = xMax - R * dR * d;
        chart.options.scales.yAxes[0].ticks.min = yMin + B * dF * d;
        chart.options.scales.yAxes[0].ticks.max = yMax - T * dF * d;
    }
    else {
        dF = (chart.options.scales.yAxes[0].ticks.max - chart.options.scales.yAxes[0].ticks.min);
        dR = (chart.options.scales.xAxes[0].ticks.max - chart.options.scales.xAxes[0].ticks.min);

        chart.options.scales.xAxes[0].ticks.min += L * dR * d;
        chart.options.scales.xAxes[0].ticks.max -= R * dR * d;
        chart.options.scales.yAxes[0].ticks.min += B * dF * d;
        chart.options.scales.yAxes[0].ticks.max -= T * dF * d;
    }

    chart.update();
}

init(f, x0, y0, x1, h);

graph.style.height = (0.89 * window.innerHeight).toString() + "px";

window.onresize = () => {
    graph.style.height = (0.89 * window.innerHeight).toString() + "px";
};