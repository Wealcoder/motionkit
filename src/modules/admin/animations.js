/**
 * MotionKit Admin — Active Animations & Hybrid Engine Manager UI.
 */
(function () {
  const config = window.motionkitAnimationsData || {};
  const ajaxUrl = config.ajaxUrl || "";
  const nonce = config.nonce || "";
  const editorUrl = config.editorUrl || "";
  const connectorActive = Boolean(config.connectorActive);
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

    // Summary stats
    const summary = document.getElementById("motionkit-animations-stat-summary");
    if (summary) {
      summary.innerHTML = `<strong>${data.total}</strong> Total Animations &bull; <span style="color:#059669;font-weight:600;">${data.waapi_count} Native WAAPI</span> &bull; <span style="color:#7c3aed;font-weight:600;">${data.gsap_count} GSAP Pro</span>`;
    }

    // Top Upgrade All button
    const upgradeAllBtn = document.getElementById("motionkit-upgrade-all-btn");
    if (upgradeAllBtn) {
      if (connectorActive && data.waapi_count > 0) {
        upgradeAllBtn.style.display = "inline-flex";
        upgradeAllBtn.querySelector(".motionkit-upgrade-text").textContent = `Upgrade All to GSAP (${data.waapi_count})`;
      } else {
        upgradeAllBtn.style.display = "none";
      }
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
            ? `<span class="motionkit-badge-engine motionkit-badge-engine--waapi">WAAPI</span>`
            : `<span class="motionkit-badge-engine motionkit-badge-engine--gsap">GSAP</span>`;

        const statusPill = anim.is_active
          ? `<span class="motionkit-status-pill motionkit-status-pill--on" data-id="${esc(anim.id)}" title="Click to toggle status"><span class="motionkit-status-dot"></span>Active</span>`
          : `<span class="motionkit-status-pill motionkit-status-pill--off" data-id="${esc(anim.id)}" title="Click to toggle status"><span class="motionkit-status-dot"></span>Draft</span>`;

        // 1-Click quick upgrade/revert
        let quickEngineBtn = "";
        if (connectorActive) {
          if (anim.engine === "waapi") {
            quickEngineBtn = `<button type="button" class="motionkit-btn-quick-engine motionkit-btn-quick-engine--upgrade motionkit-quick-switch" data-id="${esc(anim.id)}" data-target="gsap" title="Upgrade this animation to GSAP Pro">⚡ Upgrade</button>`;
          } else {
            quickEngineBtn = `<button type="button" class="motionkit-btn-quick-engine motionkit-btn-quick-engine--revert motionkit-quick-switch" data-id="${esc(anim.id)}" data-target="waapi" title="Revert this animation to Native WAAPI">↺ WAAPI</button>`;
          }
        }

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
                ${quickEngineBtn}
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

  function handleQuickSwitch(animId, targetEngine) {
    const formData = new FormData();
    formData.append("action", "motionkit_update_animation_engine");
    formData.append("nonce", nonce);
    formData.append("animation_id", animId);
    formData.append("target_engine", targetEngine);

    fetch(ajaxUrl, { method: "POST", body: formData })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          showToast(res.data.message || strings.done, "success");
          fetchAnimations();
        } else {
          showToast(res.data?.message || strings.failed, "error");
        }
      })
      .catch((err) => showToast("Error: " + err.message, "error"));
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

    if (action === "upgrade_gsap" || action === "revert_waapi") {
      const targetEngine = action === "upgrade_gsap" ? "gsap" : "waapi";
      const formData = new FormData();
      formData.append("action", "motionkit_bulk_engine_update");
      formData.append("nonce", nonce);
      formData.append("target_engine", targetEngine);
      ids.forEach((id) => formData.append("animation_ids[]", id));

      fetch(ajaxUrl, { method: "POST", body: formData })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            showToast(res.data.message || strings.done, "success");
            actionSelect.value = "";
            fetchAnimations();
          } else {
            showToast(res.data?.message || strings.failed, "error");
          }
        })
        .catch((err) => showToast("Error: " + err.message, "error"));
    } else if (action === "delete") {
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
          return fetch(ajaxUrl, { method: "POST", body: formData });
        })
      ).then(() => {
        showToast(`Updated status for ${ids.length} animation(s).`, "success");
        actionSelect.value = "";
        fetchAnimations();
      });
    }
  }

  function handleUpgradeAll() {
    if (!confirm("Upgrade all Native WAAPI animations on this site to GSAP Pro?")) {
      return;
    }

    const formData = new FormData();
    formData.append("action", "motionkit_bulk_engine_update");
    formData.append("nonce", nonce);
    formData.append("all", "1");
    formData.append("target_engine", "gsap");

    fetch(ajaxUrl, { method: "POST", body: formData })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          showToast(res.data.message || strings.done, "success");
          fetchAnimations();
        } else {
          showToast(res.data?.message || strings.failed, "error");
        }
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

    // Top Upgrade All
    const upgradeAllBtn = document.getElementById("motionkit-upgrade-all-btn");
    if (upgradeAllBtn) {
      upgradeAllBtn.addEventListener("click", handleUpgradeAll);
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

        // Quick engine switch button click
        const quickSwitch = e.target.closest(".motionkit-quick-switch");
        if (quickSwitch) {
          e.preventDefault();
          const id = quickSwitch.dataset.id;
          const target = quickSwitch.dataset.target;
          handleQuickSwitch(id, target);
          return;
        }

        // Status pill click
        const statusPill = e.target.closest(".motionkit-status-pill");
        if (statusPill) {
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
