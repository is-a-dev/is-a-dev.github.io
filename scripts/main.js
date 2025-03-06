let is_searching = false;
let pattern_domain = "^[a-zA-Z0-9_][a-zA-Z0-9.-]*";
let timer_search = undefined;
let reserved_domain = undefined;
const search_domain = document.getElementById("search-domain");
const result_card = document.getElementById("result-card");
const result_none = document.getElementById("result-none");
const result_error = document.getElementById("result-error");
const result_reserved = document.getElementById("result-reserved");
const user_avatar = document.getElementById("user-avatar");
const user_gh_link = document.getElementById("user-gh");
const user_gh_name = document.getElementById("user-gh-name");

function check() {
    const search = search_domain.value.trim().replace(/\s/g, "-").toLowerCase();
    if (isReserved(search)) {
        hideResults();
        result_reserved.classList.toggle("hidden");
        return;
    }
    if (!search || is_searching) return;
    is_searching = true;
    fetch(`https://raw.githubusercontent.com/is-a-dev/register/main/domains/${search}.json`)
        .then((response) => {
            hideResults();
            if (!response.ok && response.status !== 404) throw new Error("Something went wrong");
            return !response.ok ? null : response.json();
        })
        .then((json) => {
            if (json) {
                json.search = search;
                propagateResult(json);
            } else if (result_none.classList.contains("hidden")) result_none.classList.toggle("hidden");
        })
        .catch((reason) => {
            console.log(reason);
            if (result_error.classList.contains("hidden")) result_error.classList.toggle("hidden");
        })
        .finally(() => {
            is_searching = false;
        });
}

function propagateResult(data) {
    if (result_card.classList.contains("hidden")) result_card.classList.remove("hidden");
    var gh_link = `https://github.com/${data.owner.username}`;
    user_avatar.src = `${gh_link}.png?size=64`;
    user_gh_link.href = gh_link;
    user_gh_name.innerHTML = data.owner.username;
}

function hideResults() {
    if (!result_card.classList.contains("hidden")) result_card.classList.toggle("hidden");
    if (!result_none.classList.contains("hidden")) result_none.classList.toggle("hidden");
    if (!result_error.classList.contains("hidden")) result_error.classList.toggle("hidden");
    if (!result_reserved.classList.contains("hidden")) result_reserved.classList.toggle("hidden");
}

function isReserved(domain) {
    const reserved_domains = new Set(reserved_domain);
    return (
        reserved_domains.has(domain) ||
        reserved_domain.some((pattern) => pattern.includes("[") && new RegExp(pattern).test(domain))
    );
}

async function fetchReservedDomains() {
    try {
        if (typeof reserved_domain === "undefined") {
            if (typeof timer_search !== "undefined") {
                clearInterval(timer_search);
            }

            const response = await fetch("https://raw.githubusercontent.com/is-a-dev/register/main/util/reserved.json");
            if (!response.ok) {
                throw new Error("Something went wrong");
            }

            reserved_domain = await response.json();
            search_domain.disabled = false;
            search_domain.placeholder = "e.g. william";
        }
    } catch (error) {
        console.error("Error fetching reserved domains:", error);
    }
}

search_domain.addEventListener("input", function (evt) {
    const input_value = this.value.trim();

    if (input_value === "") {
        clearTimer();
        hideResults();
        return;
    }

    const matched_value = input_value.match(new RegExp(pattern_domain));
    if (matched_value) {
        search_domain.value = matched_value[0];
    }

    clearTimer();
    timer_search = setTimeout(() => check(), 1000);
});

function clearTimer() {
    if (timer_search !== undefined) {
        clearInterval(timer_search);
    }
}

fetchReservedDomains();
