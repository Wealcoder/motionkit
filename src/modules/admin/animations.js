/**
 * MotionKit Admin — Active Animations UI.
 */
(function () {
  const config = window.motionkitAnimationsData || {};
  const ajaxUrl = config.ajaxUrl || "";
  const nonce = config.nonce || "";
  const editorUrl = config.editorUrl || "";
  const strings = config.strings || {};

  let state = {
    animations: [],
    selectedIds: new Set(),
    search: "",
    engineFilter: "",
    debounceTimer: null,
    loading: false,
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
      tbody.innerHTML = `<tr><td colspan="7" class="motionkit-tools-empty">Loading animations...</td></tr>`;
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
          state.selectedIds.clear();
          renderTable(res.data);
        } else {
          showToast(res.data?.message || strings.failed, "error");
        }
      })
      .catch((err) => {
        state.loading = false;
        showToast("Error loading animations: " + err.message, "error");
      });
  }

  function renderTable(data) {
    const tbody = document.getElementById("motionkit-animations-tbody");
    if (!tbody) return;

    const list = state.animations;
    const selectAll = document.getElementById("motionkit-select-all");
    if (selectAll) {
      selectAll.checked = false;
      selectAll.indeterminate = false;
    }
    updateBulkApplyButton();

    // Summary in the words a site owner uses: how many, and how many of them visitors can see. The engine split lives in the type filter.
    const summary = document.getElementById("motionkit-animations-stat-summary");
    if (summary) {
      const liveCount = list.filter((anim) => anim.is_active).length;
      summary.innerHTML = `${esc(strings.onSite || "Animations on this site:")} <strong>${data.total}</strong> &bull; ${liveCount} ${esc(strings.live || "live")} &bull; ${list.length - liveCount} ${esc(strings.draft || "draft")}`;
    }

    if (!list || list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="motionkit-tools-empty">${esc(strings.noAnimations || "No animations found on this site. Open MotionKit Editor to create your first animation.")}</td></tr>`;
      return;
    }

    tbody.innerHTML = list
      .map((anim) => {
        const isSelected = state.selectedIds.has(anim.id);
        const engineBadge =
          anim.engine === "waapi"
            ? `<span class="motionkit-badge-engine motionkit-badge-engine--waapi">${esc(strings.typeFree || "Free")}</span>`
            : `<span class="motionkit-badge-engine motionkit-badge-engine--gsap">${esc(strings.typeGsap || "GSAP")}</span>`;

        // A never-published draft carries no data-id: publishing it is the editor's save, so the pill is a label here rather than a switch.
        const statusPill = anim.can_toggle === false
          ? `<span class="motionkit-status-pill motionkit-status-pill--off motionkit-status-pill--locked" title="Not published yet. Publish it from the editor."><span class="motionkit-status-dot"></span>Draft</span>`
          : anim.is_active
            ? `<span class="motionkit-status-pill motionkit-status-pill--on" data-id="${esc(anim.id)}" title="Click to toggle status"><span class="motionkit-status-dot"></span>Active</span>`
            : `<span class="motionkit-status-pill motionkit-status-pill--off" data-id="${esc(anim.id)}" title="Click to toggle status"><span class="motionkit-status-dot"></span>Draft</span>`;

        const editLink = anim.edit_url
          ? `<a href="${esc(anim.edit_url)}" target="_blank" rel="noopener" class="motionkit-btn motionkit-btn--primary motionkit-btn--sm">${esc(strings.edit || "Edit")}</a>`
          : "";

        const delBtn = `<button type="button" class="motionkit-btn motionkit-btn--outline motionkit-btn--danger motionkit-btn--sm motionkit-del-anim" data-id="${esc(anim.id)}">${esc(strings.delete || "Delete")}</button>`;

        return `
          <tr data-row-id="${esc(anim.id)}">
            <td>
              <input type="checkbox" class="motionkit-row-check" data-id="${esc(anim.id)}" ${isSelected ? "checked" : ""}>
            </td>
            <td>
              <strong>${esc(anim.title)}</strong>
              ${anim.id ? `<br><small style="color:#94a3b8;font-family:monospace;">${esc(anim.id)}</small>` : ""}
            </td>
            <td>
              <code class="motionkit-target-badge" title="${esc(anim.target)}">${esc(anim.target)}</code>
            </td>
            <td>
              <span>${esc(anim.location)}</span>
              ${anim.permalink ? `<br><a href="${esc(anim.permalink)}" target="_blank" rel="noopener" style="font-size:0.75rem;color:#2563eb;text-decoration:none;">View Page &rarr;</a>` : ""}
            </td>
            <td>${engineBadge}</td>
            <td>${statusPill}</td>
            <td>
              <div class="motionkit-actions-group">
                ${editLink}
                ${delBtn}
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
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

    if (action === "delete") {
      if (!confirm(`Are you sure you want to delete ${ids.length} selected animation(s)?`)) {
        return;
      }
      let deleted = 0;
      Promise.all(
        ids.map((id) => {
          const formData = new FormData();
          formData.append("action", "motionkit_delete_single_animation");
          formData.append("nonce", nonce);
          formData.append("animation_id", id);
          return fetch(ajaxUrl, { method: "POST", body: formData })
            .then((r) => r.json())
            .then((r) => {
              if (r.success) deleted++;
            });
        })
      ).then(() => {
        showToast(`Deleted ${deleted} animation(s).`, "success");
        actionSelect.value = "";
        fetchAnimations();
      });
    } else if (action === "toggle_status") {
      Promise.all(
        ids.map((id) => {
          const formData = new FormData();
          formData.append("action", "motionkit_toggle_animation_status");
          formData.append("nonce", nonce);
          formData.append("animation_id", id);
          return fetch(ajaxUrl, { method: "POST", body: formData })
            .then((r) => r.json())
            .catch(() => ({ success: false }));
        })
      ).then((results) => {
        // A never-published draft answers 409 with its reason; one blanket "updated" toast hid that while the row stayed as it was.
        const updated = results.filter((r) => r && r.success).length;
        const failed = results.find((r) => !r || !r.success);
        if (updated === ids.length) {
          showToast(`Updated status for ${updated} animation(s).`, "success");
        } else {
          showToast(`Updated ${updated} of ${ids.length}. ${failed?.data?.message || strings.failed}`, "error");
        }
        actionSelect.value = "";
        fetchAnimations();
      });
    }
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
          if (selectAll) {
            selectAll.checked = state.selectedIds.size === state.animations.length && state.animations.length > 0;
            selectAll.indeterminate = state.selectedIds.size > 0 && state.selectedIds.size < state.animations.length;
          }
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

        // Delete button click
        const delBtn = e.target.closest(".motionkit-del-anim");
        if (delBtn) {
          e.preventDefault();
          const id = delBtn.dataset.id;
          handleDeleteAnimation(id);
          return;
        }
      });
    }

    // Initial load
    fetchAnimations();
  });
})();
