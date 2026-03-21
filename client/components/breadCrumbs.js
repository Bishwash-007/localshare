// Renders and manages the breadcrumb navigation

const Breadcrumbs = (() => {
  const container = document.getElementById("breadcrumbs");

  //  Render 
  function render(path) {
    if (!container) return;

    // path = "" means root/home
    const parts = path ? path.split("/").filter(Boolean) : [];

    let html = `
      <a href="#" class="breadcrumb__item breadcrumb__item--link" data-path="">
        <i class="ph ph-house breadcrumb__icon"></i>
        <span>Home</span>
      </a>`;

    parts.forEach((part, i) => {
      const builtPath = parts.slice(0, i + 1).join("/");
      const isLast = i === parts.length - 1;
      html += `<i class="ph ph-caret-right breadcrumb__separator"></i>`;
      if (isLast) {
        html += `<span class="breadcrumb__item breadcrumb__item--current">${esc(part)}</span>`;
      } else {
        html += `
          <a href="#" class="breadcrumb__item breadcrumb__item--link" data-path="${esc(builtPath)}">
            ${esc(part)}
          </a>`;
      }
    });

    container.innerHTML = html;
    bindClicks();
  }

  //  Events 
  function bindClicks() {
    container?.querySelectorAll("[data-path]").forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        const path = el.dataset.path;
        // Emit a custom event that FileList listens to
        document.dispatchEvent(new CustomEvent("navigate", { detail: { path } }));
      });
    });
  }

  //  Utils ─
  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  //  Init 
  render("");

  return { render };
})();