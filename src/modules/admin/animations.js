/**
 * MotionKit Admin — Active Animations UI.
 */
(function () {
  const config = window.motionkitAnimationsData || {};
  const ajaxUrl = config.ajaxUrl || "";
  const nonce = config.nonce || "";
  const editorUrl = config.editorUrl || "";
  const strings = config.strings || {};

  // Rows rendered per Load more step; the list itself arrives whole, so paging is a rendering choice, not a request.
  const PAGE_SIZE = 20;

  let state = {
    animations: [],
    total: 0,
    // How many of the fetched rows are rendered; Load more raises it, a refetch resets it.
    visible: PAGE_SIZE,
    selectedIds: new Set(),
    search: "",
    engineFilter: "",
    debounceTimer: null,
    loading: false,
    // The id whose details popup is open, so a refetch can refresh or close it.
    openId: null,
  };

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

  function showToast(message, type = "success") {
    const existing = document.querySelector(".motionkit-toast-banner");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = `motionkit-toast-banner motionkit-toast-banner--${type}`;
    toast.innerHTML = `<span>${esc(message)}</span><button type="button" style="background:none;border:none;cursor:pointer;font-size:1.1rem;line-height:1;color:inherit;" aria-label="Close">&times;</button>`;
    
    toast.querySelector("button").addEventListener("click", () => toast.remove());

    const wrap = document.querySelector(".motionkit-animations-wrap");
    if (wrap) {
      wrap.insertBefore(toast, wrap.children[1] || wrap.firstChild);
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, 4000);
    }
  }

  function fetchAnimations() {
    state.loading = true;
    const tbody = document.getElementById("motionkit-animations-tbody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="4" class="motionkit-animations-empty">${esc(strings.loading || "Loading animations...")}</td></tr>`;
    }

    const formData = new FormData();
    formData.append("action", "motionkit_animations_list");
    formData.append("nonce", nonce);
    formData.append("search", state.search);
    formData.append("engine", state.engineFilter);

    fetch(ajaxUrl, { method: "POST", body: formData })
      .then((res) => res.json())
      .then((res) => {
        state.loading = false;
        if (res.success && res.data) {
          state.animations = res.data.animations || [];
          state.total = typeof res.data.total === "number" ? res.data.total : state.animations.length;
          state.visible = PAGE_SIZE;
          state.selectedIds.clear();
          renderTable();
          syncDetails();
        } else {
          showToast(res.data?.message || strings.failed, "error");
        }
      })
      .catch((err) => {
        state.loading = false;
        showToast("Error loading animations: " + err.message, "error");
      });
  }

  function renderTable() {
    const tbody = document.getElementById("motionkit-animations-tbody");
    if (!tbody) return;

    const list = state.animations;
    updateBulkApplyButton();

    // Summary in the words a site owner uses: how many, and how many of them visitors can see. The engine split lives in the type filter.
    const summary = document.getElementById("motionkit-animations-stat-summary");
    if (summary) {
      const liveCount = list.filter((anim) => anim.is_active).length;
      summary.innerHTML = `${esc(strings.onSite || "Animations on this site:")} <strong>${state.total}</strong> &bull; ${liveCount} ${esc(strings.live || "live")} &bull; ${list.length - liveCount} ${esc(strings.draft || "draft")}`;
    }

    if (!list || list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="motionkit-animations-empty">${esc(strings.noAnimations || "No animations found on this site. Open MotionKit Editor to create your first animation.")}</td></tr>`;
      renderFooter(0, 0);
      syncSelectAll();
      return;
    }

    const shown = list.slice(0, state.visible);

    // Title, status and one Actions button per row: four columns fit the card, so the row never scrolls sideways. Everything else about the animation is in the details popup.
    tbody.innerHTML = shown
      .map((anim) => {
        const isSelected = state.selectedIds.has(anim.id);
        return `
          <tr data-row-id="${esc(anim.id)}">
            <td class="motionkit-animations-col-check">
              <input type="checkbox" class="motionkit-row-check" data-id="${esc(anim.id)}" ${isSelected ? "checked" : ""}>
            </td>
            <td class="motionkit-animations-col-title">
              <strong>${esc(anim.title)}</strong>
              ${anim.id ? `<small class="motionkit-animations-row-id">${esc(anim.id)}</small>` : ""}
            </td>
            <td class="motionkit-animations-col-status">${statusPillHtml(anim, true)}</td>
            <td class="motionkit-animations-col-actions">
              <button type="button" class="motionkit-btn motionkit-btn--outline motionkit-btn--sm motionkit-anim-actions" data-id="${esc(anim.id)}" aria-haspopup="dialog">${esc(strings.actions || "Actions")}</button>
            </td>
          </tr>
        `;
      })
      .join("");

    renderFooter(shown.length, list.length);
    syncSelectAll();
  }

  // "Showing 20 of 93" and a Load more button until every fetched row is on the page.
  function renderFooter(shown, total) {
    const footer = document.getElementById("motionkit-animations-footer");
    if (!footer) return;
    footer.hidden = total === 0;
    const count = document.getElementById("motionkit-animations-count");
    if (count) {
      count.textContent = (strings.showing || "Showing %1$s of %2$s").replace("%1$s", shown).replace("%2$s", total);
    }
    const more = document.getElementById("motionkit-animations-more");
    if (more) more.hidden = shown >= total;
  }

  // The header checkbox reflects the rendered rows: all of them, some, or none. Rows not yet loaded are not part of a selection.
  function syncSelectAll() {
    const selectAll = document.getElementById("motionkit-select-all");
    if (!selectAll) return;
    const rendered = document.querySelectorAll(".motionkit-row-check").length;
    const checked = document.querySelectorAll(".motionkit-row-check:checked").length;
    selectAll.checked = rendered > 0 && checked === rendered;
    selectAll.indeterminate = checked > 0 && checked < rendered;
  }

  function engineBadgeHtml(anim) {
    return anim.engine === "waapi"
      ? `<span class="motionkit-badge-engine motionkit-badge-engine--waapi">${esc(strings.typeFree || "Free")}</span>`
      : `<span class="motionkit-badge-engine motionkit-badge-engine--gsap">${esc(strings.typeGsap || "GSAP")}</span>`;
  }

  // A never-published draft carries no data-id: publishing it is the editor's save, so the pill is a label rather than a switch; the popup's copy is a label too, since its Publish button does the toggling there.
  function statusPillHtml(anim, clickable) {
    const locked = anim.can_toggle === false;
    const on = !!anim.is_active;
    const label = on ? strings.statusActive || "Active" : strings.statusDraft || "Draft";
    const classes = ["motionkit-status-pill", on ? "motionkit-status-pill--on" : "motionkit-status-pill--off"];
    if (locked || !clickable) classes.push("motionkit-status-pill--locked");

    let attrs = "";
    if (locked) {
      attrs = ` title="${esc(strings.notPublished || "Not published yet. Publish it from the editor.")}"`;
    } else if (clickable) {
      attrs = ` data-id="${esc(anim.id)}" title="${esc(strings.toggleHint || "Click to toggle status")}"`;
    }

    return `<span class="${classes.join(" ")}"${attrs}><span class="motionkit-status-dot"></span>${esc(label)}</span>`;
  }

  // ─── Details popup ───

  function detailsModal() {
    return document.getElementById("motionkit-anim-modal");
  }

  function findAnimation(id) {
    return state.animations.find((anim) => anim.id === id) || null;
  }

  function fillDetails(anim) {
    const modal = detailsModal();
    if (!modal) return;
    const field = (id) => modal.querySelector(`#motionkit-anim-modal-${id}`);

    field("title").textContent = anim.title || "";

    const idEl = field("id");
    idEl.textContent = anim.id || "";
    idEl.hidden = !anim.id;

    const locked = anim.can_toggle === false;
    field("status").innerHTML =
      statusPillHtml(anim, false) +
      (locked ? `<span class="motionkit-details-hint">${esc(strings.notPublished || "Not published yet. Publish it from the editor.")}</span>` : "");

    field("type").innerHTML = engineBadgeHtml(anim);
    field("target").textContent = anim.target || "";

    field("location").innerHTML =
      esc(anim.location) +
      (anim.permalink
        ? ` <a href="${esc(anim.permalink)}" target="_blank" rel="noopener" class="motionkit-details-link">${esc(strings.viewPage || "View page")} &rarr;</a>`
        : "");

    const toggleBtn = field("toggle");
    toggleBtn.hidden = locked;
    toggleBtn.textContent = anim.is_active ? strings.setDraft || "Set as draft" : strings.publish || "Publish";

    const editLink = field("edit");
    editLink.hidden = !anim.edit_url;
    editLink.href = anim.edit_url || "#";
  }

  function openDetails(id) {
    const anim = findAnimation(id);
    const modal = detailsModal();
    if (!anim || !modal) return;
    state.openId = id;
    fillDetails(anim);
    modal.hidden = false;
    const closeBtn = modal.querySelector(".motionkit-details-close");
    if (closeBtn) closeBtn.focus();
  }

  function closeDetails() {
    const modal = detailsModal();
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    // The row's own button is looked up again rather than remembered: a refetch has usually replaced the row since the popup opened.
    const rowBtn = state.openId && window.CSS && CSS.escape
      ? document.querySelector(`.motionkit-anim-actions[data-id="${CSS.escape(state.openId)}"]`)
      : null;
    state.openId = null;
    if (rowBtn) rowBtn.focus();
  }

  // After a refetch the open popup follows its row: refreshed while the row is still listed, closed once it is gone.
  function syncDetails() {
    if (!state.openId) return;
    const anim = findAnimation(state.openId);
    if (anim) {
      fillDetails(anim);
    } else {
      closeDetails();
    }
  }

  function updateBulkApplyButton() {
    const btn = document.getElementById("motionkit-bulk-apply-btn");
    const select = document.getElementById("motionkit-bulk-action-select");
    if (!btn || !select) return;

    const hasSelection = state.selectedIds.size > 0;
    const hasAction = select.value !== "";
    btn.disabled = !(hasSelection && hasAction);
    if (hasSelection) {
      btn.textContent = `Apply (${state.selectedIds.size})`;
    } else {
      btn.textContent = "Apply";
    }
  }

  function handleToggleStatus(animId) {
    const formData = new FormData();
    formData.append("action", "motionkit_toggle_animation_status");
    formData.append("nonce", nonce);
    formData.append("animation_id", animId);

    fetch(ajaxUrl, { method: "POST", body: formData })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          showToast(`Animation status updated to ${res.data.new_status}.`, "success");
          fetchAnimations();
        } else {
          showToast(res.data?.message || strings.failed, "error");
        }
      })
      .catch((err) => showToast("Error: " + err.message, "error"));
  }

  function handleDeleteAnimation(animId) {
    if (!confirm(strings.confirmDelete || "Are you sure you want to delete this animation?")) {
      return;
    }

    const formData = new FormData();
    formData.append("action", "motionkit_delete_single_animation");
    formData.append("nonce", nonce);
    formData.append("animation_id", animId);

    fetch(ajaxUrl, { method: "POST", body: formData })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          showToast(res.data.message || "Animation deleted.", "success");
          fetchAnimations();
        } else {
          showToast(res.data?.message || strings.failed, "error");
        }
      })
      .catch((err) => showToast("Error: " + err.message, "error"));
  }

  function handleBulkAction() {
    const actionSelect = document.getElementById("motionkit-bulk-action-select");
    if (!actionSelect) return;
    const action = actionSelect.value;
    const ids = Array.from(state.selectedIds);

    if (!action || ids.length === 0) return;
    if (!["publish", "draft", "toggle_status", "delete"].includes(action)) return;

    if (action === "delete" && !confirm(`Are you sure you want to delete ${ids.length} selected animation(s)?`)) {
      return;
    }

    // One request for the whole selection, processed in order on the server: one request per row at once raced on the shared page bucket, and the last one to write undid the others while every answer said success.
    const formData = new FormData();
    formData.append("action", "motionkit_animations_bulk");
    formData.append("nonce", nonce);
    formData.append("bulk_action", action);
    ids.forEach((id) => formData.append("animation_ids[]", id));

    fetch(ajaxUrl, { method: "POST", body: formData })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success || !res.data) {
          showToast(res.data?.message || strings.failed, "error");
          return;
        }
        const { done, total, failed } = res.data;
        // A never-published draft refuses to be published from here, with its reason; one blanket "updated" toast hid that while the row stayed as it was.
        const reason = failed && failed[0] ? failed[0].message : strings.failed;
        const all = done === total;
        const doneText = {
          publish: `Published ${done} animation(s).`,
          draft: `Set ${done} animation(s) as draft.`,
          toggle_status: `Updated status for ${done} animation(s).`,
          delete: `Deleted ${done} animation(s).`,
        }[action];
        const partialText = {
          publish: `Published ${done} of ${total}.`,
          draft: `Set ${done} of ${total} as draft.`,
          toggle_status: `Updated ${done} of ${total}.`,
          delete: `Deleted ${done} of ${total}.`,
        }[action];
        showToast(all ? doneText : `${partialText} ${reason}`, all ? "success" : "error");
        actionSelect.value = "";
        fetchAnimations();
      })
      .catch((err) => showToast("Error: " + err.message, "error"));
  }

  // Bind Events
  document.addEventListener("DOMContentLoaded", () => {
    const tableWrap = document.querySelector(".motionkit-animations-wrap");
    if (!tableWrap) return;

    // Search input
    const searchInput = document.getElementById("motionkit-animations-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        clearTimeout(state.debounceTimer);
        state.search = e.target.value.trim();
        state.debounceTimer = setTimeout(() => {
          fetchAnimations();
        }, 250);
      });
    }

    // Engine filter
    const engineFilter = document.getElementById("motionkit-engine-filter");
    if (engineFilter) {
      engineFilter.addEventListener("change", (e) => {
        state.engineFilter = e.target.value;
        fetchAnimations();
      });
    }

    // Bulk select
    const bulkSelect = document.getElementById("motionkit-bulk-action-select");
    if (bulkSelect) {
      bulkSelect.addEventListener("change", updateBulkApplyButton);
    }

    // Bulk apply
    const bulkApply = document.getElementById("motionkit-bulk-apply-btn");
    if (bulkApply) {
      bulkApply.addEventListener("click", handleBulkAction);
    }

    // Select all checkbox
    const selectAll = document.getElementById("motionkit-select-all");
    if (selectAll) {
      selectAll.addEventListener("change", (e) => {
        const isChecked = e.target.checked;
        const rowChecks = document.querySelectorAll(".motionkit-row-check");
        rowChecks.forEach((chk) => {
          chk.checked = isChecked;
          const id = chk.dataset.id;
          if (id) {
            if (isChecked) state.selectedIds.add(id);
            else state.selectedIds.delete(id);
          }
        });
        updateBulkApplyButton();
      });
    }

    // Table delegated clicks
    const tbody = document.getElementById("motionkit-animations-tbody");
    if (tbody) {
      tbody.addEventListener("click", (e) => {
        // Checkbox click
        if (e.target.classList.contains("motionkit-row-check")) {
          const id = e.target.dataset.id;
          if (e.target.checked) {
            state.selectedIds.add(id);
          } else {
            state.selectedIds.delete(id);
          }
          syncSelectAll();
          updateBulkApplyButton();
          return;
        }

        // Status pill click
        const statusPill = e.target.closest(".motionkit-status-pill");
        if (statusPill && statusPill.dataset.id) {
          e.preventDefault();
          const id = statusPill.dataset.id;
          handleToggleStatus(id);
          return;
        }

        // Actions button click
        const actionsBtn = e.target.closest(".motionkit-anim-actions");
        if (actionsBtn && actionsBtn.dataset.id) {
          e.preventDefault();
          openDetails(actionsBtn.dataset.id);
          return;
        }
      });
    }

    // Load more
    const moreBtn = document.getElementById("motionkit-animations-more");
    if (moreBtn) {
      moreBtn.addEventListener("click", () => {
        state.visible += PAGE_SIZE;
        renderTable();
      });
    }

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

      const toggleBtn = document.getElementById("motionkit-anim-modal-toggle");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
          if (state.openId) handleToggleStatus(state.openId);
        });
      }

      const deleteBtn = document.getElementById("motionkit-anim-modal-delete");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          if (state.openId) handleDeleteAnimation(state.openId);
        });
      }
    }

    // Initial load
    fetchAnimations();
  });
})();
