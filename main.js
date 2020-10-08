
const DOMAINS_FILE = 'https://github.com/is-a-dev/register/tree/main/domains';

const fetchOptions = {
  method: 'GET',
  mode: 'no-cors',
  cache: 'no-cache',
  referrerPolicy: 'no-referrer',
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'text/plain'
  },
};
const fetchData = url => fetch(url, fetchOptions).then(data => data.text());

const parseDomains = body => {
  console.log(body)
  return ((body + '').match(/href="\/is\-a\-dev\/register\/blob\/main\/domains\/[0-9a-z\-]+\.json"/g) ?? []).map(href => {
    return (href.match(/\/([0-9a-z\-]+)\.json/) ?? [])[1];
  }).sort((a, b) => a.localeCompare(b));
};

const displayDomains = domains => {
  console.log(domains)
  document.querySelector('.registered').innerHTML = domains.join('<br/>');
};

window.addEventListener('DOMContentLoaded', () => {
  fetchData(DOMAINS_FILE)
    .then(parseDomains)
    .then(displayDomains);
});
