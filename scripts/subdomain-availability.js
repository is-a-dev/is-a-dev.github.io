let isSearching = false;
let reservedDomains;
let searchTimeout;
const DOMAIN_PATTERN = /^[a-zA-Z0-9_][a-zA-Z0-9.-]*/;

const searchDomain = document.getElementById("search-domain");
const resultCard = document.getElementById("result-card");
const resultNone = document.getElementById("result-none");
const resultError = document.getElementById("result-error");
const resultReserved = document.getElementById("result-reserved");
const userAvatar = document.getElementById("user-avatar");
const userGitHubLink = document.getElementById("user-gh");
const userGitHubName = document.getElementById("user-gh-name");

async function fetchReservedDomains() {
    try {
        if (!reservedDomains) {
            const response = await fetch("https://raw.githubusercontent.com/is-a-dev/register/main/util/reserved.json");
            if (!response.ok) throw new Error(`Failed to fetch reserved domains: ${response.statusText}`);
            reservedDomains = await response.json();
            searchDomain.disabled = false;
            searchDomain.placeholder = "e.g. william";
        }
    } catch (error) {
        console.error(error.message);
    }
}

function hideResults() {
    [resultCard, resultNone, resultError, resultReserved].forEach((el) => el.classList.add("hidden"));
}

function isReserved(domain) {
    return (
        reservedDomains?.includes(domain) ||
        reservedDomains?.some((pattern) => /\[/.test(pattern) && new RegExp(pattern).test(domain))
    );
}

async function check() {
    const search = searchDomain.value.trim().replace(/\s/g, "-").toLowerCase();
    if (!search || isSearching) return;

    hideResults();

    if (isReserved(search)) {
        resultReserved.classList.remove("hidden");
        return;
    }

    isSearching = true;
    try {
        const response = await fetch(`https://raw.githubusercontent.com/is-a-dev/register/main/domains/${search}.json`);
        if (!response.ok && response.status !== 404) throw new Error("Something went wrong");

        const data = response.ok ? await response.json() : null;
        if (data) {
            propagateResult(data, search);
        } else {
            resultNone.classList.remove("hidden");
        }
    } catch (error) {
        console.error(error.message);
        resultError.classList.remove("hidden");
    } finally {
        isSearching = false;
    }
}

function propagateResult(data, search) {
    resultCard.classList.remove("hidden");
    const githubURL = `https://github.com/${data.owner.username}`;
    userAvatar.src = `${githubURL}.png?size=64`;
    userGitHubLink.href = githubURL;
    userGitHubName.textContent = data.owner.username;
}

searchDomain.addEventListener("input", function () {
    const inputValue = this.value.trim();

    if (!inputValue) {
        clearTimeout(searchTimeout);
        hideResults();
        return;
    }

    const matchedValue = inputValue.match(DOMAIN_PATTERN);
    if (matchedValue) {
        searchDomain.value = matchedValue[0];
    }

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(check, 1000);
});

fetchReservedDomains();
