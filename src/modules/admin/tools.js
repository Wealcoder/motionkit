(function () {
  const config = window.motionkitToolsData || {};
  const ajaxUrl = config.ajaxUrl || "";
  const nonce = config.nonce || "";
  const noticeNonce = config.noticeNonce || "";
  const redirectUrl = config.redirectUrl || "";
  const animationsUrl = config.animationsUrl || "";
  const strings = config.strings || {};

  // The key the Animations tab filters a page by; the same shape AnimationsDataHandler::page_identity() stamps on each animation, so a row here lands on its own animations there.
  function pageKey(row) {
    if (row.store_type === "post_meta") return "post-" + row.id;
    if (row.store_type === "term_meta") return "term-" + row.id;
    const option = String(row.option || "");
    if (option.indexOf("motionkit_global_animations") === 0) return "global";
    return "option-" + option.replace(/^motionkit_pg_(animation|draft)_/, "");
  }

  // The Animations tab, narrowed to this row's page; the title rides along so the dropdown can name a page that has no animations yet.
  function animationsLink(row) {
    if (!animationsUrl) return "";
    const url = new URL(animationsUrl, window.location.href);
    url.searchParams.set("mk_page", pageKey(row));
    url.searchParams.set("mk_page_title", row.title || "");
    return url.toString();
  }

  // rows is every page fetched so far (Load more appends the next one); openRow is the index whose details popup is open.
  let state = { page: 1, totalPages: 1, total: 0, search: "", debounce: null, rows: [], openRow: null };

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

  function typePill(row) {
    return `<span class="motionkit-tools-type">${esc(row.type_label)}</span>`;
  }

  function render(data, append) {
    const tbody = document.getElementById("motionkit-tools-tbody");
    if (!tbody) return;

    const incoming = Array.isArray(data.rows) ? data.rows : [];
    const firstNew = append ? state.rows.length : 0;
    state.rows = append ? state.rows.concat(incoming) : incoming;
    state.page = data.page || state.page;
    state.totalPages = data.total_pages || 1;
    state.total = typeof data.total === "number" ? data.total : state.rows.length;
    syncDetails();

    if (!state.rows.length) {
      tbody.innerHTML = `<tr><td colspan="3" class="motionkit-tools-empty">${esc(strings.noResults || "No animation data found.")}</td></tr>`;
    } else {
      // Title, type and one Actions button per row: three columns fit the card, so the row never scrolls sideways. The modified time, the storage and the links are in the details popup.
      tbody.innerHTML = state.rows
        .map(
          (r, i) => `
            <tr>
              <td class="motionkit-tools-col-title">
                <strong>${esc(r.title)}</strong>
                <small class="motionkit-tools-row-key">${esc(r.option)}</small>
              </td>
              <td class="motionkit-tools-col-type">${typePill(r)}</td>
              <td class="motionkit-tools-col-actions">
                <button type="button" class="motionkit-btn motionkit-btn--outline motionkit-btn--sm motionkit-tools-row-actions" data-row="${i}" aria-haspopup="dialog">${esc(strings.actions || "Actions")}</button>
              </td>
            </tr>
          `
        )
        .join("");
    }

    // "Showing 20 of 46" and a Load more button while the server has pages left.
    const footer = document.getElementById("motionkit-tools-footer");
    if (!footer) return;
    footer.hidden = state.rows.length === 0;
    const count = document.getElementById("motionkit-tools-count");
    if (count) {
      count.textContent = (strings.showing || "Showing %1$s of %2$s").replace("%1$s", state.rows.length).replace("%2$s", state.total);
    }
    const more = document.getElementById("motionkit-tools-more");
    if (more) {
      more.hidden = state.page >= state.totalPages;
      more.disabled = false;
    }

    // The list scrolls inside the card, so an appended page is brought to the top of the scroll area; a fresh list starts at the top.
    const scroller = document.getElementById("motionkit-tools-scroll");
    if (scroller) {
      const row = scroller.querySelectorAll("#motionkit-tools-tbody tr")[firstNew];
      const headHeight = scroller.querySelector("thead") ? scroller.querySelector("thead").offsetHeight : 0;
      scroller.scrollTo({ top: row && append ? Math.max(0, row.offsetTop - headHeight) : 0, behavior: append ? "smooth" : "auto" });
    }
  }

  // The server pages at 20; a fresh list fetches page 1, Load more fetches the next page and appends it.
  function fetchList(append) {
    const fd = new FormData();
    fd.append("action", "motionkit_tools_list");
    fd.append("nonce", nonce);
    fd.append("page", state.page);
    fd.append("search", state.search);
    fetch(ajaxUrl, { method: "POST", credentials: "same-origin", body: fd })
      .then((r) => r.json())
      .then((j) => {
        if (j && j.success) render(j.data, append);
      });
  }

  // The per-row delete is a real POST through the hidden form, which the connector answers with a redirect back to the tab.
  function deleteRow(row) {
    if (!row) return;
    if (!confirm(strings.confirm || "Delete this animation data?")) return;
    const f = document.getElementById("motionkit-tools-delete-form");
    if (!f) return;
    f.querySelector("[name=store_type]").value = row.store_type;
    f.querySelector("[name=option_key]").value = row.option;
    f.querySelector("[name=object_id]").value = row.id;
    f.submit();
  }

  // ─── Details popup ───

  function detailsModal() {
    return document.getElementById("motionkit-tools-modal");
  }

  function fillDetails(row) {
    const modal = detailsModal();
    if (!modal) return;
    const field = (id) => modal.querySelector(`#motionkit-tools-modal-${id}`);

    field("title").textContent = row.title || "";
    field("key").textContent = row.option || "";
    field("type").innerHTML = typePill(row);
    field("modified").textContent = row.modified || strings.never || "Not recorded";
    field("store").textContent = row.id ? `${row.store_type} #${row.id}` : String(row.store_type || "");

    const animations = field("animations");
    const link = animationsLink(row);
    animations.hidden = !link;
    animations.href = link || "#";

    const preview = field("preview");
    preview.hidden = !row.permalink;
    preview.href = row.permalink || "#";

    const edit = field("edit");
    edit.hidden = !row.edit_url;
    edit.href = row.edit_url || "#";
  }

  function openDetails(index) {
    const row = state.rows[index];
    const modal = detailsModal();
    if (!row || !modal) return;
    state.openRow = index;
    fillDetails(row);
    modal.hidden = false;
    const closeBtn = modal.querySelector(".motionkit-details-close");
    if (closeBtn) closeBtn.focus();
  }

  function closeDetails() {
    const modal = detailsModal();
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    const rowBtn = state.openRow === null ? null : document.querySelector(`.motionkit-tools-row-actions[data-row="${state.openRow}"]`);
    state.openRow = null;
    if (rowBtn) rowBtn.focus();
  }

  // After a refetch the open popup follows its row: refreshed while the row is still listed, closed once it is gone.
  function syncDetails() {
    if (state.openRow === null) return;
    const row = state.rows[state.openRow];
    if (row) {
      fillDetails(row);
    } else {
      closeDetails();
    }
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

    const moreBtn = document.getElementById("motionkit-tools-more");
    if (moreBtn) {
      moreBtn.addEventListener("click", () => {
        if (state.page >= state.totalPages) return;
        moreBtn.disabled = true;
        state.page += 1;
        fetchList(true);
      });
    }

    document.addEventListener("click", (e) => {
      const actionsBtn = e.target.closest(".motionkit-tools-row-actions");
      if (actionsBtn) {
        e.preventDefault();
        openDetails(parseInt(actionsBtn.dataset.row, 10));
      }
    });

    // Details popup
    const modal = detailsModal();
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target.closest("[data-details-close]")) {
          closeDetails();
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.hidden) {
          closeDetails();
        }
      });

      const deleteBtn = document.getElementById("motionkit-tools-modal-delete");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          if (state.openRow !== null) deleteRow(state.rows[state.openRow]);
        });
      }
    }

    // delete all flow
    const confirmModal = document.getElementById("motionkit-tools-confirm");
    const progress = document.getElementById("motionkit-tools-progress");
    const fill = document.getElementById("motionkit-progress-fill");
    const label = document.getElementById("motionkit-progress-label");
    const confirmBtn = document.getElementById("motionkit-tools-confirm-btn");
    const cancelBtn = document.getElementById("motionkit-tools-cancel");
    const deleteAllBtn = document.getElementById("motionkit-tools-delete-all");

    if (deleteAllBtn && confirmModal) {
      deleteAllBtn.addEventListener("click", () => {
        if (progress) progress.hidden = true;
        if (fill) fill.style.width = "0%";
        if (label) label.textContent = "0 / 0";
        if (confirmBtn) confirmBtn.disabled = false;
        if (cancelBtn) cancelBtn.disabled = false;
        confirmModal.hidden = false;
      });
    }

    if (cancelBtn && confirmModal) {
      cancelBtn.addEventListener("click", () => {
        confirmModal.hidden = true;
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
