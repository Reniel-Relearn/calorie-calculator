const messages = {
  info: ["Information example", "This message adds useful context to a task.", "info"],
  success: ["Success example", "The preview interaction completed. Nothing was saved.", "check"],
  warning: ["Warning example", "Explain what needs attention without relying on color alone.", "warning"],
  error: ["Error example", "Explain the issue and give the user a useful recovery action.", "warning"],
};

for (const button of document.querySelectorAll("[data-feedback]")) {
  button.addEventListener("click", () => {
    const kind = button.dataset.feedback;
    const [title, copy, icon] = messages[kind];
    const panel = document.getElementById("feedback-example");
    panel.className = kind === "info" ? "status-message" : `status-message status-message--${kind}`;
    document.getElementById("feedback-title").textContent = title;
    document.getElementById("feedback-copy").textContent = copy;
    const symbol = document.getElementById("feedback-icon");
    const url = new URL(symbol.getAttribute("href"), window.location.href);
    url.hash = icon;
    symbol.setAttribute("href", url.href);
  });
}

const form = document.getElementById("specimen-form");
const name = document.getElementById("sample-name");
const error = document.getElementById("sample-name-error");
const status = document.getElementById("sample-form-status");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const valid = name.value.trim().length >= 2;
  error.hidden = valid;
  error.textContent = valid ? "" : "Enter at least two characters for this example.";
  name.setAttribute("aria-invalid", String(!valid));
  status.textContent = valid ? "Validation example passed. Nothing was saved." : "";
  if (!valid) name.focus();
});
name.addEventListener("input", () => {
  name.removeAttribute("aria-invalid");
  error.hidden = true;
  status.textContent = "";
});

const amount = document.getElementById("sample-amount");
const decrease = document.getElementById("sample-decrease");
function updateDecrease() {
  decrease.disabled = !Number.isFinite(amount.valueAsNumber) || amount.valueAsNumber <= Number(amount.min);
}
decrease.addEventListener("click", () => { amount.stepDown(); updateDecrease(); });
document.getElementById("sample-increase").addEventListener("click", () => { amount.stepUp(); updateDecrease(); });
amount.addEventListener("input", updateDecrease);
updateDecrease();

const dialog = document.getElementById("sample-dialog");
const opener = document.getElementById("sample-dialog-open");
opener.addEventListener("click", () => dialog.showModal());
document.getElementById("sample-dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => opener.focus());
