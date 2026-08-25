(function () {
  const config = window.motionkitToolsData || {};
  const ajaxUrl = config.ajaxUrl || "";
  const nonce = config.nonce || "";
  const noticeNonce = config.noticeNonce || "";
  const redirectUrl = config.redirectUrl || "";
  const strings = config.strings || {};

  let state = { page: 1, search: "", debounce: null };

  function esc(s) {
    return String(s == null ? "" : s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c])
    );
  }

  function render(data) {
    const tbody = document.getElementById("motionkit-tools-tbody");
    if (!tbody) return;

    if (!data.rows || !data.rows.length) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="motionkit-tools-empty">' +
        esc(strings.noResults || "No animation data found.") +
        "</td></tr>";
    } else {
      tbody.innerHTML = data.rows
        .map((r) => {
          const edit = r.edit_url
            ? '<a href="' +
              esc(r.edit_url) +
              '" target="_blank" class="motionkit-btn motionkit-btn--primary motionkit-btn--sm">' +
              esc(strings.edit || "Edit") +
              "</a>"
            : "";
          const preview = r.permalink
            ? '<a href="' +
              esc(r.permalink) +
              '" target="_blank" rel="noopener" class="motionkit-btn motionkit-btn--outline motionkit-btn--sm">' +
              esc(strings.preview || "Preview") +
              "</a>"
            : "";
          const del =
            '<button type="button" class="motionkit-btn motionkit-btn--outline motionkit-btn--danger motionkit-btn--sm motionkit-del-row" data-store="' +
            esc(r.store_type) +
            '" data-option="' +
            esc(r.option) +
            '" data-id="' +
            esc(r.id) +
            '">' +
            esc(strings.del || "Delete") +
            "</button>";
          return (
            "<tr>" +
            "<td><strong>" +
            esc(r.title) +
            '</strong><br><small style="color:#6b7280;">' +
            esc(r.option) +
            "</small></td>" +
            '<td><span class="motionkit-tools-type">' +
            esc(r.type_label) +
            "</span></td>" +
            "<td>" +
            esc(r.modified || "—") +
            "</td>" +
            '<td><div class="motionkit-tools-actions">' +
            edit +
            preview +
            del +
            "</div></td>" +
            "</tr>"
          );
        })
        .join("");
    }

    // pagination
    const pg = document.getElementById("motionkit-tools-pagination");
    if (!pg) return;
    if (data.total_pages <= 1) {
      pg.innerHTML = "";
      return;
    }
    let html = "";
    html +=
      '<button class="motionkit-page-btn" ' +
      (data.page <= 1 ? "disabled" : "") +
      ' data-page="' +
      (data.page - 1) +
      '">' +
      esc(strings.prev || "Prev") +
      "</button>";
    for (let i = 1; i <= data.total_pages; i++) {
      if (i === 1 || i === data.total_pages || Math.abs(i - data.page) <= 2) {
        html +=
          '<button class="motionkit-page-btn ' +
          (i === data.page ? "motionkit-page-btn--active" : "") +
          '" data-page="' +
          i +
          '">' +
          i +
          "</button>";
      } else if (Math.abs(i - data.page) === 3) {
        html +=
          '<span class="motionkit-page-btn" style="border:0;background:transparent;">…</span>';
      }
    }
    html +=
      '<button class="motionkit-page-btn" ' +
      (data.page >= data.total_pages ? "disabled" : "") +
      ' data-page="' +
      (data.page + 1) +
      '">' +
      esc(strings.next || "Next") +
      "</button>";
    pg.innerHTML = html;
  }

  function fetchList() {
    const fd = new FormData();
    fd.append("action", "motionkit_tools_list");
    fd.append("nonce", nonce);
    fd.append("page", state.page);
    fd.append("search", state.search);
    fetch(ajaxUrl, { method: "POST", credentials: "same-origin", body: fd })
      .then((r) => r.json())
      .then((j) => {
        if (j && j.success) render(j.data);
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("motionkit-tools-search");
    if (!searchInput) return;

    const runSearch = (value, immediate) => {
      clearTimeout(state.debounce);
      const apply = () => {
        state.search = value;
        state.page = 1;
        fetchList();
      };
      if (immediate) apply();
      else state.debounce = setTimeout(apply, 300);
    };

    searchInput.addEventListener("input", (e) =>
      runSearch(e.target.value, false)
    );
    searchInput.addEventListener("search", (e) =>
      runSearch(e.target.value, true)
    );
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.target.value = "";
        runSearch("", true);
      }
    });

    document.addEventListener("click", (e) => {
      const pbtn = e.target.closest(".motionkit-page-btn[data-page]");
      if (pbtn && !pbtn.disabled) {
        state.page = parseInt(pbtn.dataset.page, 10) || 1;
        fetchList();
        return;
      }

      const drow = e.target.closest(".motionkit-del-row");
      if (drow) {
        if (!confirm(strings.confirm || "Delete this animation data?")) return;
        const f = document.getElementById("motionkit-tools-delete-form");
        if (f) {
          f.querySelector("[name=store_type]").value = drow.dataset.store;
          f.querySelector("[name=option_key]").value = drow.dataset.option;
          f.querySelector("[name=object_id]").value = drow.dataset.id;
          f.submit();
        }
      }
    });

    // delete all flow
    const modal = document.getElementById("motionkit-tools-confirm");
    const progress = document.getElementById("motionkit-tools-progress");
    const fill = document.getElementById("motionkit-progress-fill");
    const label = document.getElementById("motionkit-progress-label");
    const confirmBtn = document.getElementById("motionkit-tools-confirm-btn");
    const cancelBtn = document.getElementById("motionkit-tools-cancel");
    const deleteAllBtn = document.getElementById("motionkit-tools-delete-all");

    if (deleteAllBtn && modal) {
      deleteAllBtn.addEventListener("click", () => {
        if (progress) progress.hidden = true;
        if (fill) fill.style.width = "0%";
        if (label) label.textContent = "0 / 0";
        if (confirmBtn) confirmBtn.disabled = false;
        if (cancelBtn) cancelBtn.disabled = false;
        modal.hidden = false;
      });
    }

    if (cancelBtn && modal) {
      cancelBtn.addEventListener("click", () => {
        modal.hidden = true;
      });
    }

    async function runBulk() {
      if (confirmBtn) confirmBtn.disabled = true;
      if (cancelBtn) cancelBtn.disabled = true;
      if (progress) progress.hidden = false;
      // The server always deletes from the front of a fresh scan and reports how many records remain, so progress is grandTotal - remaining — no client-side offset (an offset would skip records as the list shrinks).
      let first = true;
      let totalDeleted = 0;
      let grandTotal = 0;
      while (true) {
        const fd = new FormData();
        fd.append("action", "motionkit_tools_bulk_delete");
        fd.append("nonce", nonce);
        if (first) fd.append("first", "1");
        const r = await fetch(ajaxUrl, {
          method: "POST",
          credentials: "same-origin",
          body: fd,
        });
        const j = await r.json();
        if (!j || !j.success) {
          if (label) label.textContent = "Error";
          return;
        }
        if (first) grandTotal = j.data.total;
        first = false;
        totalDeleted += j.data.deleted;
        const doneCount = Math.max(0, grandTotal - j.data.remaining);
        const pct = grandTotal
          ? Math.min(100, Math.round((doneCount / grandTotal) * 100))
          : 100;
        if (fill) fill.style.width = pct + "%";
        if (label) label.textContent = doneCount + " / " + grandTotal;
        if (j.data.done) break;
      }
      if (label) label.textContent = (strings.done || "Done!") + " (" + totalDeleted + ")";
      setTimeout(() => {
        window.location.href =
          redirectUrl +
          "&tools_all_deleted=" +
          totalDeleted +
          "&_wpnonce=" +
          noticeNonce;
      }, 600);
    }

    if (confirmBtn) {
      confirmBtn.addEventListener("click", runBulk);
    }

    // initial load
    fetchList();
  });
})();
