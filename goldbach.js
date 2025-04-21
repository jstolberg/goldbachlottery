const LOWER_CAP = 4000000000000000000n;
const WHEEL = [1n, 7n, 11n, 13n, 17n, 19n, 23n, 29n];
const WHEEL_SIZE = 30n;

function* wheelCandidates(end) {
    let base = 0n;
    while (base <= end) {
        for (let offset of WHEEL) {
            let candidate = base + offset;
            if (candidate > end) return;
            yield candidate;
        }
        base += WHEEL_SIZE;
    }
}

function randomBigInt(max) {
    const bytes = (max.toString(2).length + 7) >> 3; 
    let rand;
    do {
        const buffer = crypto.getRandomValues(new Uint8Array(bytes));
        rand = BigInt('0x' + [...buffer].map(b => b.toString(16).padStart(2, '0')).join(''));
    } while (rand > max);
    return rand;
}

function modPow(base, exponent, mod) {
    let result = 1n;
    base = base % mod;

    while (exponent > 0) {
        if (exponent % 2n === 1n) {
            result = (result * base) % mod;
        }
        base = (base * base) % mod;
        exponent = exponent / 2n;
    }
    return result;
}

// Miller-Rabin primality test
function isPrime(n, k = 40) {
    if (n === 2n || n === 3n) return true;
    if (n < 2n || n % 2n === 0n) return false;

    let r = 0n;
    let d = n - 1n;
    while (d % 2n === 0n) {
        d /= 2n;
        r += 1n;
    }

    const tryComposite = (a) => {
        let x = modPow(a, d, n);
        if (x === 1n || x === n - 1n) return false;
        for (let i = 0n; i < r - 1n; i++) {
            x = modPow(x, 2n, n);
            if (x === n - 1n) return false;
        }
        return true;
    };

    for (let i = 0; i < k; i++) {
        const a = 2n + randomBigInt(n- 4n);
        if (tryComposite(a)) return false;
    }

    return true; 
}

function goldbach(n) {
    for (let i of wheelCandidates(n / 2n)) {
        if (isPrime(i) && isPrime(n - i)) {
            return [i, n-i];
        }
    }
    return null;
}

function submit() {
    const input = document.getElementById("numberInput").value;
    const outputDiv = document.getElementById("output");
    let n;
    console.log("test");

    try {
        n = BigInt(input);
    } catch (e) {
        outputDiv.innerHTML = "Please enter a valid integer.";
        return;
    }

    if (n % 2n !== 0n) {
        outputDiv.innerHTML = "Number must be an even integer.";
        return;
    }

    if (n <= LOWER_CAP) {
        outputDiv.innerHTML = "No use guessing lower than 4.000.000.000.000.000.000.";
        return;
    }

    let result = goldbach(n);
    if (result) {
        outputDiv.innerHTML = `A prime partition exists<div class="prime-partition">${n}<br />=<br />${result[0]} + ${result[1]}</div><em style="color:rgb(200, 49, 2)">You lost.</em>`;
    } else {
        outputDiv.innerHTML = `No prime partition found.<br /><br /><em style="color:rgb(39, 175, 62)">You won!!!</em>`;
    }
}

const input = document.querySelector('input');
const button = document.querySelector('button');

input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
    button.click();
    }
});