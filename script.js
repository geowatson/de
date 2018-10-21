let chart, xAxis, yAxis, yExact;
let x0 = 1, x1 = 5, y0 = 0.5, h = 0.01;
let method = "euler";

// for calculating optimal usage of graph
let yMax = -1000, xMax = -1000, yMin = 1000, xMin = 1000;

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
    yExact = xAxis.map(x => exact(x));

    if (yAxis.length > yExact.length) {
        yAxis.splice(yExact.length - 1, yAxis.length - yExact.length);
    }
    else if (yAxis.length < yExact.length) {
        yAxis.splice(yAxis.length - 1, yExact.length - yAxis.length);
    }

    chart.data.labels = xAxis;
    chart.data.datasets[0].data = yAxis;
    chart.data.datasets[1].data = yExact;
    document.getElementById("N").innerText = N;
    document.getElementById("h").innerText = h;

    chart.update();
}

function defineX(from, to, delta) {
    let arr = [];
    let count = Math.floor((to - from) / delta);

    for (let i = 0; i <= count; ++i) {
        arr.push(from + i * delta);
    }

    return arr;
}

function defineY(funct, y0, xAxis, delta) {
    let arr = [y0];
    let count = Math.floor((xAxis[xAxis.length - 1] - xAxis[0]) / delta);

    if (method === "euler") {
        for (let i = 1; i <= count; ++i) {
            arr.push(arr[i - 1] + delta * funct(xAxis[i - 1], arr[i - 1]));
            // in general case it is not correct to do that way,
            // but here for better performance we can assume it.
            if (arr[i] > 1.4) {
                arr[i] = 1.4;
                break;
            }
        }
    }
    else if (method === "improvedEuler") {
        for (let i = 1; i <= count; ++i) {
            arr.push(arr[i - 1] + delta / 2 * (funct(xAxis[i - 1], arr[i - 1]) + funct(xAxis[i - 1], arr[i - 1] + delta * funct(xAxis[i - 1], arr[i - 1]))));
            if (arr[i] > 1.4) {
                arr[i] = 1.4;
                break;
            }
        }
    }
    else {
        for (let i = 1; i <= count; ++i) {
            let k1 = funct(xAxis[i - 1], arr[i - 1]);
            let k2 = funct(xAxis[i - 1] + delta / 2, arr[i - 1] + delta / 2 * k1);
            let k3 = funct(xAxis[i - 1] + delta / 2, arr[i - 1] + delta / 2 * k2);
            let k4 = funct(xAxis[i - 1] + delta, arr[i - 1] + delta * k3);
            arr.push(arr[i - 1] + delta / 6 * (k1 + 2 * k2 + 2 * k3 + k4));
            if (arr[i] > 1.4) {
                arr[i] = 1.4;
                break;
            }
        }
    }

    return arr;
}

function init(funct, x0, y0, x1, h) {
    xAxis = defineX(x0, x1, h);
    yAxis = defineY(funct, y0, xAxis, h);
    yExact = xAxis.map(x => exact(x));
    document.getElementById("N").innerText = Math.floor((x1 - x0) / h).toString();
    document.getElementById("h").innerText = h;

    if (yAxis.length > yExact.length) {
        yAxis.splice(yExact.length - 1, yAxis.length - yExact.length);
    }
    else if (yAxis.length < yExact.length) {
        yAxis.splice(yAxis.length - 1, yExact.length - yAxis.length);
    }

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
                data: yAxis,
                borderColor: "#3e95cd",
                label: "Numerical",
                fill: false,
            }, {
                data: yExact,
                borderColor: "red",
                label: "Exact",
                fill: false,
            },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: true,
            },
            title: {
                display: true,
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
        },
    });
}

init(f, x0, y0, x1, h);

document.getElementsByClassName("graph")[0].style.height = (0.89 * window.innerHeight).toString() + "px";

window.onresize = () => {
    document.getElementsByClassName("graph")[0].style.height = (0.89 * window.innerHeight).toString() + "px";
};

document.getElementsByClassName("graph")[0].onwheel = (something) => {
    console.log(something.deltaY);
};