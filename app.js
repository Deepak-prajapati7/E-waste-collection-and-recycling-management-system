(() => {
  "use strict";

  /* ------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------ */
  const STORE = {
    theme: "ecocycle-theme",
    requests: "ecocycle.v2.requests",
    session: "ecocycle.v2.session",
    accounts: "ecocycle.v2.accounts",
  };

  const CATEGORIES = [
    {
      name: "Computers",
      code: "PC",
      desc: "Desktops, laptops, monitors, keyboards and mice",
      note: "",
    },
    {
      name: "Mobile phones",
      code: "PH",
      desc: "Phones, tablets, chargers and accessories",
      note: "Remove SIM and memory cards",
    },
    {
      name: "Batteries",
      code: "BT",
      desc: "Rechargeable and household batteries",
      note: "Keep damaged batteries separate",
    },
    {
      name: "Televisions",
      code: "TV",
      desc: "LCD, LED, plasma and other displays",
      note: "Handle screens upright",
    },
    {
      name: "Printers",
      code: "PR",
      desc: "Printers, scanners, fax machines, ink and toner units",
      note: "",
    },
    {
      name: "Cables",
      code: "CB",
      desc: "Power cords, adapters, USB cables and other wiring",
      note: "",
    },
    {
      name: "Game consoles",
      code: "GC",
      desc: "Consoles, controllers and handheld devices",
      note: "Sign out of accounts",
    },
    {
      name: "Audio equipment",
      code: "AU",
      desc: "Speakers, headphones, radios and stereo equipment",
      note: "",
    },
    {
      name: "Cameras",
      code: "CA",
      desc: "Digital cameras, camcorders, lenses and accessories",
      note: "Remove memory cards",
    },
    {
      name: "Small appliances",
      code: "SA",
      desc: "Small electric kitchen, grooming and household appliances",
      note: "",
    },
    {
      name: "Networking equipment",
      code: "NW",
      desc: "Routers, modems, switches and network accessories",
      note: "",
    },
    {
      name: "Wearables",
      code: "WR",
      desc: "Smartwatches, fitness trackers and other electronic wearables",
      note: "Built-in batteries: do not open",
    },
    {
      name: "Lamps and lighting",
      code: "LT",
      desc: "LED lamps and electronic lighting",
      note: "Ask the point about special handling",
    },
    {
      name: "Other small electronics",
      code: "OT",
      desc: "Calculators, toys, power banks and other small devices",
      note: "Power banks: treat as batteries",
    },
  ];

  const STATUSES = [
    "Pending",
    "Approved",
    "Scheduled",
    "Collected",
    "Processing",
    "Completed",
    "Rejected",
    "Cancelled",
  ];
  const IN_PROGRESS = ["Approved", "Scheduled", "Collected", "Processing"];
  const sKey = (s) => String(s || "").toLowerCase();

  const NAV = {
    user: [
      { id: "overview", label: "Overview", icon: "grid" },
      { id: "new", label: "New request", icon: "plus" },
      { id: "requests", label: "My requests", icon: "list" },
      { id: "map", label: "Find a point", icon: "pin" },
      { id: "categories", label: "Categories", icon: "box" },
      { id: "guide", label: "Safety guide", icon: "book" },
    ],
    admin: [
      { id: "overview", label: "Overview", icon: "grid" },
      { id: "requests", label: "All requests", icon: "list" },
      { id: "map", label: "Recycling points", icon: "pin" },
      { id: "guide", label: "Safety guide", icon: "book" },
    ],
  };
  const TITLES = {
    overview: "Overview",
    new: "New request",
    requests: { user: "My requests", admin: "All requests" },
    map: { user: "Find a drop-off point", admin: "Recycling points" },
    categories: "Accepted categories",
    guide: "Safety guide",
  };

  const QUICK_CITIES = [
    "Delhi",
    "Mumbai",
    "Bengaluru",
    "Chennai",
    "Kolkata",
    "Hyderabad",
    "Pune",
    "Jaipur",
    "Lucknow",
    "Ahmedabad",
  ];

  /* ------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------ */
  const $ = (id) => document.getElementById(id);
  const esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const icon = (n) =>
    `<svg class="i" aria-hidden="true"><use href="#i-${n}"/></svg>`;

  const pad = (n) => String(n).padStart(2, "0");
  const toISO = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayISO = () => toISO(new Date());
  const fmtDate = (iso) => {
    const d = new Date(String(iso).length <= 10 ? `${iso}T00:00:00` : iso);
    return Number.isNaN(d.getTime())
      ? String(iso || "")
      : d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };
  const fmtDateTime = (iso) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? ""
      : d.toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
  };
  const displayId = (id) => `ECO-${id}`;
  const initials = (name) =>
    String(name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");

  const store = {
    get(k) {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, v);
        return true;
      } catch {
        return false;
      }
    },
  };

  function readStoredJson(key, fallback) {
    const value = store.get(key);
    if (value === null) return fallback;
    try {
      return JSON.parse(value);
    } catch {
      throw new Error("Saved browser data is invalid. Clear this site's stored data and try again.");
    }
  }

  function writeStoredJson(key, value) {
    if (!store.set(key, JSON.stringify(value))) {
      throw new Error("The browser could not save data. Check available storage and try again.");
    }
  }

  function currentProfile() {
    const profile = readStoredJson(STORE.session, null);
    if (profile === null) throw new Error("Please sign in to continue.");
    if (!isProfile(profile)) {
      throw new Error("Saved account data is invalid. Sign in again.");
    }
    return profile;
  }

  const TOKEN_KEY = "ecocycle_jwt_token";

  function setBackendStatus(online) {
    const pill = $("backendPill");
    const text = $("backendStatusText");
    if (!pill || !text) return;
    if (online) {
      pill.classList.remove("is-offline");
      text.textContent = "MongoDB Active";
      pill.title = "Connected to Node.js & MongoDB Server";
    } else {
      pill.classList.add("is-offline");
      text.textContent = "Offline Preview";
      pill.title = "Server offline - run 'npm start' to connect to MongoDB";
    }
  }

  // Ping server health
  try {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => {
        const isDb = data.database && (data.database.connected || data.status === "healthy");
        setBackendStatus(isDb);
      })
      .catch(() => setBackendStatus(false));
  } catch (_) {}

  async function api(path, options = {}) {
    const token = store.get(TOKEN_KEY);
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(path, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (data.token) {
        store.set(TOKEN_KEY, data.token);
      }
      if (path === "/api/auth/logout") {
        store.set(TOKEN_KEY, null);
      }

      setBackendStatus(true);
      return data;
    } catch (netErr) {
      setBackendStatus(false);
      return localApiFallback(path, options);
    }
  }

  async function localApiFallback(path, options = {}) {
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : {};
    if (method === "POST" && path === "/api/auth/login") {
      const email = String(body.email || "").trim().toLowerCase();
      const role = body.role;
      const accounts = readStoredJson(STORE.accounts, []);
      const account =
        role === "user" && email === "rahul@example.com" && body.password === "demo1234"
          ? { name: "Rahul Sharma", email, role: "user" }
          : role === "admin" && email === "admin@example.com" && body.password === "demo1234"
            ? { name: "System Admin", email, role: "admin" }
            : accounts.find(
                (saved) =>
                  saved.email === email &&
                  saved.password === body.password &&
                  role === "user",
              );
      if (!account) throw new Error("Email, role, or password is incorrect.");
      const profile = { name: account.name, email: account.email, role: account.role || role };
      writeStoredJson(STORE.session, profile);
      return profile;
    }
    if (method === "POST" && path === "/api/auth/register") {
      const name = String(body.name || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = body.password;
      const accounts = readStoredJson(STORE.accounts, []);
      if (!name) throw new Error("Enter your full name.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Enter a valid email address.");
      }
      if (typeof password !== "string" || password.length < 8 || password.length > 128) {
        throw new Error("Password must be between 8 and 128 characters.");
      }
      if (
        email === "rahul@example.com" ||
        email === "admin@example.com" ||
        accounts.some((saved) => saved.email === email)
      ) {
        throw new Error("An account with that email already exists.");
      }
      const account = { name, email, password, role: "user" };
      writeStoredJson(STORE.accounts, [...accounts, account]);
      const profile = { name, email, role: "user" };
      writeStoredJson(STORE.session, profile);
      return profile;
    }
    if (method === "POST" && path === "/api/auth/logout") {
      writeStoredJson(STORE.session, null);
      return { ok: true };
    }
    if (method === "GET" && path === "/api/auth/session") {
      return currentProfile();
    }
    const profile = currentProfile();
    if (method === "GET" && path === "/api/requests") {
      const requests = readStoredJson(STORE.requests, []);
      if (!Array.isArray(requests) || !requests.every(isRequest)) {
        throw new Error("Saved collection requests are invalid. Clear this site's stored data and try again.");
      }
      return profile.role === "admin"
        ? requests
        : requests.filter((request) => request.email.toLowerCase() === profile.email.toLowerCase());
    }
    if (method === "POST" && path === "/api/requests") {
      if (profile.role !== "user") throw new Error("Only users can submit requests.");
      const requests = readStoredJson(STORE.requests, []);
      const request = {
        id: Date.now(),
        user: profile.name,
        email: profile.email,
        category: String(body.category || ""),
        method: body.method,
        qty: Number(body.qty),
        date: String(body.date || ""),
        location: String(body.location || ""),
        notes: String(body.notes || ""),
        phone: String(body.phone || ""),
        status: "Pending",
        createdAt: new Date().toISOString(),
        history: [{ status: "Pending", at: new Date().toISOString(), by: profile.name }],
      };
      if (!isRequest(request)) throw new Error("The collection request is invalid.");
      writeStoredJson(STORE.requests, [request, ...requests]);
      return request;
    }
    const requestRoute = path.match(/^\/api\/requests\/(\d+)(?:\/status)?$/);
    if (requestRoute && method === "PATCH" && path.endsWith("/status")) {
      const requests = readStoredJson(STORE.requests, []);
      const request = requests.find((entry) => String(entry.id) === requestRoute[1]);
      if (!request) throw new Error("Request not found.");
      if (
        profile.role === "user" &&
        (body.status !== "Cancelled" || request.email.toLowerCase() !== profile.email.toLowerCase() || request.status !== "Pending")
      ) {
        throw new Error("Users can only cancel their own pending requests.");
      }
      if (!STATUSES.includes(body.status)) throw new Error("Choose a valid status.");
      request.status = body.status;
      request.history = request.history || [];
      request.history.push({ status: body.status, at: new Date().toISOString(), by: profile.name });
      writeStoredJson(STORE.requests, requests);
      return request;
    }
    if (requestRoute && method === "DELETE" && !path.endsWith("/status")) {
      if (profile.role !== "admin") throw new Error("Administrator access is required.");
      const requests = readStoredJson(STORE.requests, []);
      const remaining = requests.filter((entry) => String(entry.id) !== requestRoute[1]);
      if (remaining.length === requests.length) throw new Error("Request not found.");
      writeStoredJson(STORE.requests, remaining);
      return { ok: true };
    }
    if (path === "/api/centers") {
      return (typeof FALLBACK_CERTIFIED_CENTERS !== "undefined" ? FALLBACK_CERTIFIED_CENTERS : []);
    }
    throw new Error("This action is not available.");
  }

  const localApi = api;

  async function loadRequests() {
    const requests = await localApi("/api/requests");
    if (!Array.isArray(requests)) {
      throw new Error("Saved collection requests are invalid.");
    }
    state.requests = requests.map((r) => {
      r.id = r.id || r.numericId || r._id;
      return r;
    });
  }

  function isRequest(r) {
    if (!r || typeof r !== "object") return false;
    r.id = r.id || r.numericId || r._id;
    return (
      ["string", "number"].includes(typeof r.id) &&
      String(r.id).trim() !== "" &&
      typeof r.user === "string" &&
      typeof r.email === "string" &&
      typeof r.category === "string" &&
      ["Pickup", "Drop-off"].includes(r.method) &&
      typeof r.date === "string" &&
      typeof r.location === "string" &&
      STATUSES.includes(r.status)
    );
  }

  function isProfile(profile) {
    return (
      profile !== null &&
      typeof profile === "object" &&
      ["admin", "user"].includes(profile.role) &&
      typeof profile.name === "string" &&
      profile.name.trim() !== "" &&
      typeof profile.email === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)
    );
  }

  /* ------------------------------------------------------------------
   * State
   * ------------------------------------------------------------------ */
  const state = {
    user: null,
    requests: [],
    view: "overview",
    openRequestId: null,
  };
  const isAdmin = () => state.user?.role === "admin";
  const myRequests = () =>
    isAdmin()
      ? state.requests
      : state.requests.filter(
          (r) =>
            String(r.email || "").toLowerCase() ===
            state.user.email.toLowerCase(),
        );
  const findRequest = (id) =>
    state.requests.find((r) => String(r.id) === String(id));

  /* ------------------------------------------------------------------
   * Theme, toast, modal
   * ------------------------------------------------------------------ */
  function setTheme(theme) {
    const dark = theme === "dark";
    document.body.dataset.theme = dark ? "dark" : "light";
    const btn = $("themeToggle");
    btn.setAttribute(
      "aria-label",
      dark ? "Switch to light theme" : "Switch to dark theme",
    );
    btn.innerHTML = icon(dark ? "sun" : "moon");
    store.set(STORE.theme, dark ? "dark" : "light");
  }

  function toast(message, type = "ok") {
    const el = document.createElement("div");
    el.className = `toast${type === "error" ? " is-error" : ""}`;
    el.innerHTML = `${icon(type === "error" ? "alert" : "check")}<span>${esc(message)}</span>`;
    $("toasts").appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  function confirmDialog({ title, text, confirmLabel = "Delete" }) {
    return new Promise((resolve) => {
      const modal = $("modal");
      $("modalTitle").textContent = title;
      $("modalText").textContent = text;
      $("modalOk").textContent = confirmLabel;
      modal.hidden = false;
      const previous = document.activeElement;
      $("modalCancel").focus();
      const done = (v) => {
        modal.hidden = true;
        $("modalOk").onclick = $("modalCancel").onclick = null;
        modal.onclick = null;
        document.removeEventListener("keydown", onKey, true);
        previous?.focus?.();
        resolve(v);
      };
      const onKey = (e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          done(false);
        }
      };
      document.addEventListener("keydown", onKey, true);
      $("modalOk").onclick = () => done(true);
      $("modalCancel").onclick = () => done(false);
      modal.onclick = (e) => {
        if (e.target === modal) done(false);
      };
    });
  }

  /* ------------------------------------------------------------------
   * Auth
   * ------------------------------------------------------------------ */
  let authMode = "login";
  function setAuthMode(mode) {
    authMode = mode;
    const signup = mode === "signup";
    $("authNameField").hidden = !signup;
    $("authTitle").textContent = signup ? "Create account" : "Sign in";
    $("authDescription").textContent = signup
      ? "Create a user account. Administrator access is provisioned separately."
      : "Use your account to continue.";
    $("authSubmit").textContent = signup ? "Create account" : "Sign in";
    $("authPassword").autocomplete = signup
      ? "new-password"
      : "current-password";
    $("authPassword").minLength = 8;
    $("authPassword").placeholder = signup
      ? "At least 8 characters"
      : "Enter your password";
    $("authRole").disabled = signup;
    if (signup) $("authRole").value = "user";
    for (const [id, active] of [
      ["loginTab", !signup],
      ["signupTab", signup],
    ]) {
      $(id).classList.toggle("is-active", active);
      $(id).setAttribute("aria-selected", String(active));
    }
    $("authMessage").textContent = "";
  }

  async function startSession(profile) {
    await loadRequests();
    state.user = profile;
    $("auth").hidden = true;
    $("app").hidden = false;
    $("avatar").textContent = initials(profile.name);
    $("topbarAvatar").textContent = initials(profile.name);
    $("topbarAvatar").title = `${profile.name} · ${profile.role === "admin" ? "Administrator" : "User"}`;
    $("accountName").textContent = profile.name;
    $("accountRole").textContent =
      profile.role === "admin" ? "Administrator" : "User";
    $("roleCaption").textContent =
      profile.role === "admin" ? "Operations" : "Collections";
    $("todayLabel").textContent = new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    buildNav();
    setupStaticControls();
    route();
  }

  async function endSession() {
    let logoutError = "";
    try {
      await localApi("/api/auth/logout", { method: "POST" });
    } catch (error) {
      logoutError = error.message;
    }
    state.user = null;
    state.requests = [];
    closeDrawer();
    $("toasts").replaceChildren();
    $("app").hidden = true;
    $("auth").hidden = false;
    $("authForm").reset();
    setAuthMode("login");
    $("authMessage").textContent = logoutError
      ? `Signed out on this page, but the server could not end the session: ${logoutError}`
      : "";
    history.replaceState(null, "", location.pathname);
  }

  async function submitAuth(e) {
    e.preventDefault();
    const email = $("authEmail").value.trim().toLowerCase();
    const password = $("authPassword").value;
    const role = $("authRole").value;
    const msg = $("authMessage");
    if (authMode === "signup" && !$("authName").value.trim()) {
      msg.textContent = "Enter your full name.";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = "Enter a valid email address.";
      return;
    }
    const minLength = authMode === "signup" ? 8 : 6;
    if (password.length < minLength) {
      msg.textContent = `Password must be at least ${minLength} characters.`;
      return;
    }
    const signup = authMode === "signup";
    const payload = signup
      ? { name: $("authName").value.trim(), email, password }
      : { email, password, role: $("authRole").value };
    const submit = $("authSubmit");
    submit.disabled = true;
    msg.textContent = "";
    try {
      const profile = await localApi(
        signup ? "/api/auth/register" : "/api/auth/login",
        { method: "POST", body: JSON.stringify(payload) },
      );
      await startSession(profile);
    } catch (error) {
      msg.textContent = error.message;
    } finally {
      submit.disabled = false;
    }
  }

  /* ------------------------------------------------------------------
   * Navigation & routing
   * ------------------------------------------------------------------ */
  function buildNav() {
    const items = NAV[state.user.role];
    $("nav").innerHTML = items
      .map(
        (n) =>
          `<a href="#/${n.id}" data-nav="${n.id}">${icon(n.icon)}<span>${esc(n.label)}</span><span class="badge" data-badge="${n.id}" hidden></span></a>`,
      )
      .join("");
  }

  function updateBadges() {
    const el = document.querySelector('[data-badge="requests"]');
    const n = isAdmin()
      ? state.requests.filter((r) => r.status === "Pending").length
      : 0;
    if (el) {
      el.hidden = !n;
      el.textContent = n;
      el.title = n ? `${n} pending review` : "";
    }
    const topbarBadge = $("topbarBadge");
    topbarBadge.hidden = !n;
    topbarBadge.textContent = n > 9 ? "9+" : n;
    topbarBadge.title = n ? `${n} pending review` : "";
  }

  function currentHash() {
    return location.hash.replace(/^#\/?/, "").split("?")[0] || "overview";
  }

  function setNavOpen(open) {
    $("app").classList.toggle("nav-open", open);
    $("menuButton").setAttribute("aria-expanded", String(open));
    $("menuButton").setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    $("menuButton").innerHTML = icon(open ? "x" : "menu");
  }

  function route() {
    if (!state.user) return;
    const focusHeading =
      $("app").classList.contains("nav-open") &&
      window.matchMedia("(max-width: 860px)").matches;
    const allowed = NAV[state.user.role].map((n) => n.id);
    let view = currentHash();
    if (!allowed.includes(view)) view = "overview";
    state.view = view;
    document
      .querySelectorAll(".view")
      .forEach((s) => (s.hidden = s.id !== `view-${view}`));
    document.querySelectorAll("#nav a").forEach((a) => {
      if (a.dataset.nav === view) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    const t = TITLES[view];
    const title = typeof t === "string" ? t : t[state.user.role];
    $("pageTitle").textContent = title;
    document.title = `${title} – EcoCycle`;
    $("app").classList.toggle("is-overview", view === "overview");
    setNavOpen(false);
    updateBadges();
    if (view === "overview") renderOverview();
    if (view === "requests") renderRequests();
    if (view === "new") prepareForm();
    if (view === "categories") renderCategories();
    if (view === "map") showMap();
    const main = $("main-content");
    if (main) main.setAttribute("tabindex", "-1");
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    if (focusHeading) $("pageTitle").focus();
    else if (main) main.focus({ preventScroll: true });
  }

  /* ------------------------------------------------------------------
   * Shared renderers
   * ------------------------------------------------------------------ */
  const pill = (status) =>
    `<span class="pill s-${sKey(status)}">${esc(status)}</span>`;

  function requestRow(r, withRequester) {
    const isOwner = !isAdmin() && String(r.email).toLowerCase() === state.user.email.toLowerCase();
    const canCancel = isOwner && r.status === "Pending";
    return `<tr class="row-link" tabindex="0" data-open="${esc(r.id)}">
      <td><span class="id">${esc(displayId(r.id))}</span><span class="sub">${esc(fmtDate(r.createdAt))}</span></td>
      ${withRequester ? `<td class="col-requester"><strong>${esc(r.user)}</strong><span class="sub">${esc(r.email || "")}</span></td>` : ""}
      <td><strong>${esc(r.category)}</strong>${r.qty > 1 ? `<span class="sub">Qty: ${esc(r.qty)}</span>` : ""}</td>
      <td class="method">${esc(r.method)}</td>
      <td class="num">${esc(fmtDate(r.date))}</td>
      <td class="col-location"><div class="clip" title="${esc(r.location)}">${esc(r.location)}</div></td>
      <td>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          ${pill(r.status)}
          ${canCancel ? `<button class="btn btn-sm btn-ghost-danger tbl-action-btn" type="button" data-cancel-row="${esc(r.id)}" title="Cancel request">Cancel</button>` : ""}
        </div>
      </td>
    </tr>`;
  }

  /* ------------------------------------------------------------------
   * Overview
   * ------------------------------------------------------------------ */
  function kpi(label, value, note) {
    const details = {
      "Total requests": ["clock", "blue"],
      "My requests": ["list", "blue"],
      "Awaiting review": ["check", "green"],
      "In progress": ["grid", "purple"],
      Completed: ["check", "amber"],
      "Rejected or cancelled": ["x", "rose"],
    };
    const [glyph, tone] = details[label] || ["box", "blue"];
    return `<article class="kpi kpi-${tone}">
      <div class="kpi-heading"><span class="kpi-icon">${icon(glyph)}</span><span class="kpi-label">${esc(label)}</span></div>
      <div class="kpi-value">${esc(value)}</div>
      <div class="kpi-note">${esc(note)}</div>
    </article>`;
  }

  function weekBuckets(requests, weeks = 8) {
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
    ); // Monday
    const buckets = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const s = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() - i * 7,
      );
      const e = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 7);
      buckets.push({ start: s, end: e, count: 0 });
    }
    for (const r of requests) {
      const t = new Date(r.createdAt).getTime();
      const b = buckets.find(
        (x) => t >= x.start.getTime() && t < x.end.getTime(),
      );
      if (b) b.count++;
    }
    return buckets;
  }

  function updateSustainabilityAndPipeline(mine, count, done) {
    // Environmental Calculations
    const totalWeight = mine.reduce((sum, r) => sum + (r.actualWeight || r.estimatedWeight || (r.qty || 1) * 2.8), 0);
    const completedWeight = mine.filter((r) => r.status === "Completed").reduce((sum, r) => sum + (r.actualWeight || r.estimatedWeight || (r.qty || 1) * 2.8), 0);
    const co2Saved = Math.round(completedWeight * 1.44);
    const metalsGrams = Math.round(completedWeight * 135);
    const recoveryRate = mine.length ? Math.round((done / mine.length) * 100) : 100;

    if ($("statEwaste")) $("statEwaste").innerHTML = `${Math.round(totalWeight * 10) / 10}<small>kg</small>`;
    if ($("statCo2")) $("statCo2").innerHTML = `${co2Saved}<small>kg</small>`;
    if ($("statMetals")) $("statMetals").innerHTML = `${metalsGrams}<small>g</small>`;
    if ($("statRate")) $("statRate").innerHTML = `${recoveryRate}<small>%</small>`;

    // Pipeline funnel
    const pipelineSteps = [
      { name: "Pending Review", status: "Pending", color: "#f5ac32" },
      { name: "Approved", status: "Approved", color: "#12aaa0" },
      { name: "Scheduled", status: "Scheduled", color: "#3679ed" },
      { name: "Collected", status: "Collected", color: "#32b66a" },
      { name: "Processing", status: "Processing", color: "#784be8" },
      { name: "Completed", status: "Completed", color: "#22a879" },
    ];

    if ($("pipelineTrack")) {
      $("pipelineTrack").innerHTML = pipelineSteps.map((step) => {
        const cnt = count((r) => r.status === step.status);
        return `<div class="pipeline-step" data-pipeline-status="${step.status}" style="--step-color: ${step.color}">
          <div class="pipeline-step-top">
            <span class="pipeline-step-num">${cnt}</span>
            <span class="pipeline-step-dot"></span>
          </div>
          <div class="pipeline-step-name">${step.name}</div>
        </div>`;
      }).join("");

      $("pipelineTrack").querySelectorAll(".pipeline-step").forEach((el) => {
        el.addEventListener("click", () => {
          const st = el.dataset.pipelineStatus;
          $("statusFilter").value = st;
          location_hash("#/requests");
        });
      });
    }
  }

  function renderOverview() {
    const mine = myRequests();
    const count = (fn) => mine.filter(fn).length;
    const pending = count((r) => r.status === "Pending");
    const active = count((r) => IN_PROGRESS.includes(r.status));
    const done = count((r) => r.status === "Completed");

    updateSustainabilityAndPipeline(mine, count, done);

    if (isAdmin()) {
      $("kpis").innerHTML =
        kpi("Total requests", mine.length, "All time") +
        kpi(
          "Awaiting review",
          pending,
          pending ? "Needs a decision" : "Queue is clear",
        ) +
        kpi("In progress", active, "Approved to processing") +
        kpi(
          "Completed",
          done,
          mine.length
            ? `${Math.round((done / mine.length) * 100)}% of all requests`
            : "No requests yet",
        ) +
        kpi(
          "Rejected or cancelled",
          count((r) => ["Rejected", "Cancelled"].includes(r.status)),
          "Closed without collection",
        );

      const statusCounts = STATUSES.map((s) => ({
        s,
        n: count((r) => r.status === s),
      }));
      const total = mine.length || 1;
      const byCat = Object.entries(
        mine.reduce(
          (a, r) => ((a[r.category] = (a[r.category] || 0) + 1), a),
          {},
        ),
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
      const maxCat = Math.max(1, ...byCat.map((c) => c[1]));
      const weeks = weekBuckets(mine, 6);
      const maxWeek = Math.max(1, ...weeks.map((w) => w.count));
      const weekScale = Math.max(8, Math.ceil(maxWeek / 2) * 2);
      const statusColors = {
        Pending: "#f5ac32",
        Scheduled: "#3679ed",
        Processing: "#784be8",
        Rejected: "#e74670",
        Approved: "#12aaa0",
        Collected: "#32b66a",
        Completed: "#22a879",
        Cancelled: "#9aa7b8",
      };
      let statusStop = 0;
      const donutStops = statusCounts
        .filter((x) => x.n)
        .map((x) => {
          const start = statusStop;
          statusStop += (x.n / total) * 100;
          return `${statusColors[x.s]} ${start}% ${statusStop}%`;
        })
        .join(", ");
      const queue = mine
        .filter((r) => r.status === "Pending")
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .slice(0, 5);

      $("overviewGrid").innerHTML = `
        <section class="panel status-panel">
          <div class="panel-head"><h2>Requests by status</h2></div>
          <div class="panel-body status-content">
            <div class="donut-wrap">
              <div class="status-donut" role="img" aria-label="Status distribution: ${statusCounts.filter((x) => x.n).map((x) => `${x.n} ${x.s.toLowerCase()}`).join(", ") || "no requests"}" style="--donut:${donutStops || "#dce3ed 0% 100%"}">
                <div><strong>${mine.length}</strong><span>Total requests</span></div>
              </div>
            </div>
            <ul class="legend">
              ${statusCounts.filter((x) => x.n).map((x) => `<li><i style="--legend-color:${statusColors[x.s]}"></i><span>${esc(x.s)}</span><b>${x.n}</b><small>${Math.round((x.n / total) * 100)}%</small></li>`).join("")}
            </ul>
          </div>
        </section>
        <section class="panel">
          <div class="panel-head"><h2>Requests by category</h2><span class="panel-tag">Top ${byCat.length}</span></div>
          <div class="panel-body">
            ${byCat.length ? `<ul class="bars">${byCat.map(([n, c], i) => {
              const code = CATEGORIES.find((category) => category.name === n)?.code || n.slice(0, 2).toUpperCase();
              return `<li class="category-bar">
                <span class="category-mark category-mark-${i % 6}" aria-hidden="true">${esc(code)}</span>
                <span class="bar-label" title="${esc(n)}">${esc(n)}</span>
                <span class="bar-track"><span class="bar-fill" style="display:block;width:${(c / maxCat) * 100}%"></span></span>
                <span class="bar-val">${c}</span><small>${Math.round((c / total) * 100)}%</small>
              </li>`;
            }).join("")}</ul>` : `<p class="hint">No requests yet.</p>`}
          </div>
        </section>
        <section class="panel weekly-panel">
          <div class="panel-head"><h2>Requests per week</h2><span class="panel-tag">Last 6 weeks</span></div>
          <div class="panel-body weekly-body">
            <div class="weekly-chart" role="img" aria-label="Requests per week: ${weeks.map((w) => `${w.count} on week starting ${w.start.toLocaleDateString("en-IN")}`).join(", ")}">
              <div class="chart-axis">${[weekScale, weekScale * .75, weekScale * .5, weekScale * .25, 0].map((tick) => `<span>${Math.round(tick)}</span>`).join("")}</div>
              <div class="chart-plot">
                ${weeks.map((w) => `<div class="week-column"><b>${w.count || ""}</b><span style="height:${(w.count / weekScale) * 100}%"></span></div>`).join("")}
              </div>
            </div>
            <div class="week-labels">${weeks.map((w, i) => `<span>Week ${i + 1}</span>`).join("")}</div>
          </div>
        </section>
        <section class="panel flush">
          <div class="panel-head"><h2>Awaiting review</h2><a class="link queue-link" href="#/requests">Open tracker <span aria-hidden="true">→</span></a></div>
          ${
            queue.length
              ? `<ul class="queue">${queue
                  .map(
                    (r) => `
            <li>
              <span class="queue-icon" aria-hidden="true">${esc(CATEGORIES.find((category) => category.name === r.category)?.code || r.category.slice(0, 2).toUpperCase())}</span>
              <div class="queue-main" data-open="${esc(r.id)}" tabindex="0">
                <strong>${esc(r.category)} · ${esc(r.user)}</strong>
                <span>${esc(r.method)} · ${esc(fmtDate(r.date))} · ${esc(r.location)}</span>
              </div>
              <div class="queue-actions">
                <button class="btn btn-sm" type="button" data-quick="Approved" data-id="${esc(r.id)}">Approve</button>
                <button class="btn btn-sm btn-ghost-danger" type="button" data-quick="Rejected" data-id="${esc(r.id)}">Reject</button>
              </div>
            </li>`,
                  )
                  .join("")}</ul>`
              : `<div class="empty"><strong>No requests waiting</strong>New requests will appear here.</div>`
          }
        </section>`;
    } else {
      const upcoming = mine
        .filter((r) => IN_PROGRESS.includes(r.status) || r.status === "Pending")
        .filter((r) => r.date >= todayISO())
        .sort((a, b) => a.date.localeCompare(b.date))[0];
      $("kpis").innerHTML =
        kpi("My requests", mine.length, "All time") +
        kpi("Awaiting review", pending, "Not yet approved") +
        kpi("In progress", active, "Approved to processing") +
        kpi("Completed", done, "Recycled");

      const recent = [...mine]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5);
      $("overviewGrid").innerHTML = `
        <section class="panel flush">
          <div class="panel-head"><h2>Recent requests</h2><a class="link" href="#/requests">View all</a></div>
          ${
            recent.length
              ? `<div class="table-wrap"><table class="tbl"><thead><tr><th scope="col">Request</th><th scope="col">Category</th><th scope="col">Date</th><th scope="col">Status</th></tr></thead><tbody>
            ${recent.map((r) => `<tr class="row-link" tabindex="0" data-open="${esc(r.id)}"><td><span class="id">${esc(displayId(r.id))}</span></td><td>${esc(r.category)}<span class="sub">${esc(r.method)}</span></td><td class="num">${esc(fmtDate(r.date))}</td><td>${pill(r.status)}</td></tr>`).join("")}
          </tbody></table></div>`
              : `<div class="empty"><strong>No requests yet</strong>Book a pickup or choose a drop-off point.<br /><a class="btn btn-primary" href="#/new">New request</a></div>`
          }
        </section>
        <section class="panel flush">
          <div class="panel-head"><h2>Next steps</h2></div>
          <ul class="next-list">
            <li><div>${upcoming ? `<strong>Next handover: ${esc(fmtDate(upcoming.date))}</strong><small>${esc(upcoming.category)} · ${esc(upcoming.method)}</small>` : `<strong>No handover scheduled</strong><small>Create a request to book one</small>`}</div>${upcoming ? `<button class="btn btn-sm" type="button" data-open="${esc(upcoming.id)}">View</button>` : `<a class="btn btn-sm btn-primary" href="#/new">New request</a>`}</li>
            <li><div><strong>Find a drop-off point</strong><small>Recycling points and shops on a map</small></div><a class="btn btn-sm" href="#/map">Open map</a></li>
            <li><div><strong>Check the safety guide</strong><small>Batteries and devices</small></div><a class="btn btn-sm" href="#/guide">Read</a></li>
          </ul>
        </section>`;
    }
  }

  /* ------------------------------------------------------------------
   * Requests list
   * ------------------------------------------------------------------ */
  let controlsReady = false;
  let activeTabFilter = "all";

  function setupStaticControls() {
    if (controlsReady) {
      refreshStatusFilter();
      return;
    }
    controlsReady = true;
    $("requestSearch").addEventListener("input", renderRequests);
    $("globalSearchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const query = $("globalSearch").value.trim();
      if (!query) {
        $("globalSearch").focus();
        return;
      }
      $("requestSearch").value = query;
      if (state.view === "requests") renderRequests();
      else location_hash("#/requests");
    });
    $("statusFilter").addEventListener("change", () => {
      activeTabFilter = $("statusFilter").value;
      updateFilterTabsUI();
      renderRequests();
    });
    $("methodFilter").addEventListener("change", renderRequests);
    $("exportCsv").addEventListener("click", exportCsv);

    // Setup filter tab buttons
    const tabs = document.querySelectorAll("#requestFilterTabs .filter-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        activeTabFilter = tab.dataset.status;
        updateFilterTabsUI();
        if (activeTabFilter === "all") {
          $("statusFilter").value = "all";
        } else if (activeTabFilter === "In Progress") {
          $("statusFilter").value = "all";
        } else {
          $("statusFilter").value = activeTabFilter;
        }
        renderRequests();
      });
    });

    refreshStatusFilter();
  }

  function updateFilterTabsUI() {
    const tabs = document.querySelectorAll("#requestFilterTabs .filter-tab");
    tabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.status === activeTabFilter);
    });
  }

  function refreshStatusFilter() {
    $("statusFilter").innerHTML =
      `<option value="all">All statuses</option>` +
      STATUSES.map((s) => `<option value="${s}">${s}</option>`).join("");
    $("exportCsv").hidden = !isAdmin();
    $("requestSearch").placeholder = isAdmin()
      ? "Search by name, item, location or ID"
      : "Search my requests";
  }

  function filteredRequests() {
    const q = $("requestSearch").value.trim().toLowerCase();
    const st = $("statusFilter").value;
    const me = $("methodFilter").value;
    return myRequests()
      .filter((r) => {
        if (activeTabFilter === "In Progress") {
          return IN_PROGRESS.includes(r.status);
        }
        if (activeTabFilter !== "all" && r.status !== activeTabFilter) {
          return false;
        }
        return (st === "all" || r.status === st) && (me === "all" || r.method === me);
      })
      .filter(
        (r) =>
          !q ||
          [
            displayId(r.id),
            r.id,
            r.user,
            r.email,
            r.category,
            r.location,
            r.method,
            r.status,
          ].some((f) =>
            String(f ?? "")
              .toLowerCase()
              .includes(q),
          ),
      )
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  function renderRequests() {
    const withReq = isAdmin();
    document.querySelector(".col-requester").hidden = !withReq;
    const rows = filteredRequests();
    const total = myRequests().length;
    const mine = myRequests();
    const count = (fn) => mine.filter(fn).length;

    // Update filter tab counters
    if ($("badgeAll")) $("badgeAll").textContent = total;
    if ($("badgePending")) $("badgePending").textContent = count((r) => r.status === "Pending");
    if ($("badgeActive")) $("badgeActive").textContent = count((r) => IN_PROGRESS.includes(r.status));
    if ($("badgeCompleted")) $("badgeCompleted").textContent = count((r) => r.status === "Completed");
    if ($("badgeCancelled")) $("badgeCancelled").textContent = count((r) => ["Rejected", "Cancelled"].includes(r.status));

    $("requestCount").textContent =
      `${rows.length} of ${total} ${total === 1 ? "request" : "requests"}`;
    $("requestsBody").innerHTML = rows.length
      ? rows.map((r) => requestRow(r, withReq)).join("")
      : `<tr><td colspan="${withReq ? 7 : 6}"><div class="empty"><strong>${total ? "No requests match these filters" : "No requests yet"}</strong>${total ? "Try clearing the search or status filter." : isAdmin() ? "Requests will appear here when users submit them." : 'Create your first request to get started.<br /><a class="btn btn-primary" href="#/new">New request</a>'}</div></td></tr>`;
    updateBadges();
  }

  function csvCell(v) {
    let s = String(v ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // avoid spreadsheet formula execution
    return `"${s.replace(/"/g, '""')}"`;
  }
  function exportCsv() {
    const rows = filteredRequests();
    const head = [
      "Request ID",
      "Requester",
      "Email",
      "Phone",
      "Category",
      "Quantity",
      "Method",
      "Date",
      "Location",
      "Status",
      "Created",
      "Notes",
    ];
    const lines = [head.map(csvCell).join(",")].concat(
      rows.map((r) =>
        [
          displayId(r.id),
          r.user,
          r.email,
          r.phone,
          r.category,
          r.qty,
          r.method,
          r.date,
          r.location,
          r.status,
          r.createdAt,
          r.notes,
        ]
          .map(csvCell)
          .join(","),
      ),
    );
    const blob = new Blob(["﻿" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ecocycle-requests-${todayISO()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast(
      `Exported ${rows.length} ${rows.length === 1 ? "request" : "requests"}`,
    );
  }

  /* ------------------------------------------------------------------
   * Drawer
   * ------------------------------------------------------------------ */
  let drawerReturnFocus = null;
  function openDrawer(id) {
    const r = findRequest(id);
    if (!r) return;
    if (
      !isAdmin() &&
      String(r.email).toLowerCase() !== state.user.email.toLowerCase()
    )
      return;
    state.openRequestId = r.id;
    drawerReturnFocus = document.activeElement;
    renderDrawer();
    $("drawerScrim").hidden = false;
    $("drawer").hidden = false;
    $("drawerClose").focus();
  }
  function closeDrawer() {
    if ($("drawer").hidden) return;
    $("drawer").hidden = true;
    $("drawerScrim").hidden = true;
    state.openRequestId = null;
    drawerReturnFocus?.focus?.();
  }
  function renderDrawer() {
    const r = findRequest(state.openRequestId);
    if (!r) return closeDrawer();
    $("drawerTitle").textContent = displayId(r.id);
    $("drawerSub").innerHTML = pill(r.status);
    const hist = [...(r.history || [])].reverse();
    const canCancel = !isAdmin() && r.status === "Pending";
    const estWeight = r.actualWeight || r.estimatedWeight || (r.qty || 1) * 2.8;

    $("drawerBody").innerHTML = `
      <dl class="dl">
        <dt>Requester</dt><dd><strong>${esc(r.user)}</strong><br /><span class="hint">${esc(r.email || "")}${r.phone ? ` · ${esc(r.phone)}` : ""}</span></dd>
        <dt>Category</dt><dd>${esc(r.category)}${r.qty ? ` · Quantity ${esc(r.qty)}` : ""}</dd>
        <dt>Method</dt><dd>${esc(r.method)}</dd>
        <dt>${r.method === "Drop-off" ? "Drop-off date" : "Pickup date"}</dt><dd>${esc(fmtDate(r.date))}</dd>
        <dt>${r.method === "Drop-off" ? "Drop-off point" : "Address"}</dt><dd>${esc(r.location)}</dd>
        ${r.notes ? `<dt>Notes</dt><dd>${esc(r.notes)}</dd>` : ""}
        <dt>Submitted</dt><dd>${esc(fmtDateTime(r.createdAt))}</dd>
      </dl>

      ${
        r.status === "Completed"
          ? `
        <div class="estimator-box" style="margin: 16px 0 20px;">
          <div class="estimator-head">
            <svg class="i"><use href="#i-check" /></svg>
            <span>Circularity & Recovery Certificate</span>
          </div>
          <div class="estimator-stats">
            <div class="estimator-stat"><strong>${estWeight} kg</strong><span>Materials Diverted</span></div>
            <div class="estimator-stat"><strong>${Math.round(estWeight * 1.44)} kg</strong><span>CO₂ Avoided</span></div>
            <div class="estimator-stat"><strong>${Math.round(estWeight * 120)} g</strong><span>Metals Recovered</span></div>
          </div>
        </div>`
          : ""
      }

      <h3>Tracking Timeline & Audit Log</h3>
      <ol class="timeline">
        ${hist.map((h) => `<li><strong>${esc(h.status)}</strong><small>${esc(fmtDateTime(h.at))}${h.by ? ` · by ${esc(h.by)}` : ""}${h.note ? ` (${esc(h.note)})` : ""}</small></li>`).join("")}
      </ol>

      ${
        isAdmin()
          ? `
        <h3>Update status</h3>
        <div class="manage">
          <label class="sr-only" for="drawerStatus">Status</label>
          <select id="drawerStatus">${STATUSES.map((s) => `<option ${s === r.status ? "selected" : ""}>${s}</option>`).join("")}</select>
          <button class="btn btn-primary" type="button" id="drawerSave">Save</button>
        </div>
        <div class="drawer-danger"><button class="btn btn-ghost-danger" type="button" id="drawerDelete">${icon("trash")}Delete request</button></div>`
          : canCancel
            ? `<div class="drawer-danger"><button class="btn btn-ghost-danger" type="button" id="drawerCancel">Cancel this request</button></div>`
            : ""
      }
    `;
  }

  async function setStatus(r, status) {
    if (r.status === status) return false;
    const updated = await localApi(`/api/requests/${encodeURIComponent(r.id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    const index = state.requests.findIndex(
      (request) => String(request.id) === String(updated.id),
    );
    if (index === -1) state.requests.unshift(updated);
    else state.requests[index] = updated;
    return true;
  }
  function afterChange(message) {
    updateBadges();
    if (state.view === "overview") renderOverview();
    if (state.view === "requests") renderRequests();
    if (!$("drawer").hidden) renderDrawer();
    toast(message);
  }

  /* ------------------------------------------------------------------
   * New request form
   * ------------------------------------------------------------------ */
  function selectedMethod() {
    return document.querySelector('input[name="fMethod"]:checked').value;
  }
  function applyMethod() {
    const drop = selectedMethod() === "Drop-off";
    $("fAddressField").hidden = drop;
    $("fDropField").hidden = !drop;
    $("fDateLabel").textContent = drop ? "Drop-off date" : "Pickup date";
  }
  let formControlsReady = false;

  function updateCategoryGuidance() {
    const catName = $("fCategory").value;
    const cat = CATEGORIES.find((c) => c.name === catName);
    const tipEl = $("categorySafetyTip");
    const tipText = $("categorySafetyText");
    if (tipEl && tipText) {
      if (cat && cat.note) {
        tipText.innerHTML = `<strong>${esc(cat.name)} safety note:</strong> ${esc(cat.note)}. Keep items intact and separate.`;
        tipEl.hidden = false;
      } else {
        tipEl.hidden = true;
      }
    }
    updateImpactEstimator();
  }

  function updateImpactEstimator() {
    const catName = $("fCategory")?.value;
    const qty = Math.max(1, parseInt($("fQty")?.value, 10) || 1);
    const catWeights = {
      Computers: 6.5,
      "Mobile phones": 0.3,
      Batteries: 0.5,
      Televisions: 14.0,
      Printers: 7.0,
      Cables: 0.8,
      "Game consoles": 3.2,
      "Audio equipment": 2.4,
      Cameras: 0.9,
      "Small appliances": 2.2,
      "Networking equipment": 1.1,
      Wearables: 0.2,
      "Lamps and lighting": 0.4,
      "Other small electronics": 0.6,
    };
    const avgW = catWeights[catName] || 2.5;
    const weight = Math.round(qty * avgW * 10) / 10;
    const co2 = Math.round(weight * 1.44 * 10) / 10;
    const metals = Math.round(weight * 125);

    if ($("estWeight")) $("estWeight").textContent = `~${weight} kg`;
    if ($("estCo2")) $("estCo2").textContent = `~${co2} kg CO₂`;
    if ($("estRecovered")) $("estRecovered").textContent = `~${metals} g`;
  }

  function prepareForm() {
    if (isAdmin()) return;
    $("fName").value = state.user.name;
    $("fEmail").value = state.user.email;
    $("fDate").min = todayISO();
    if (!$("fCategory").options.length) {
      $("fCategory").innerHTML = CATEGORIES.map(
        (c) => `<option>${esc(c.name)}</option>`,
      ).join("");
    }
    if (pendingDrop) {
      document.querySelector(
        'input[name="fMethod"][value="Drop-off"]',
      ).checked = true;
      $("fDrop").value = pendingDrop;
      pendingDrop = "";
    }
    if (pendingCategory) {
      $("fCategory").value = pendingCategory;
      pendingCategory = "";
    }
    applyMethod();
    $("requestError").textContent = "";

    if (!formControlsReady) {
      formControlsReady = true;
      $("fCategory").addEventListener("change", updateCategoryGuidance);
      $("fQty").addEventListener("input", updateImpactEstimator);

      // Wire quick date chips
      const chips = document.querySelectorAll("#quickDateChips .date-chip");
      chips.forEach((btn) => {
        btn.addEventListener("click", () => {
          const days = parseInt(btn.dataset.days, 10) || 1;
          const d = new Date();
          d.setDate(d.getDate() + days);
          $("fDate").value = d.toISOString().slice(0, 10);
        });
      });
    }

    updateCategoryGuidance();
  }
  let pendingDrop = "";
  let pendingCategory = "";

  async function submitRequest(e) {
    e.preventDefault();
    if (isAdmin()) return;
    const err = $("requestError");
    const method = selectedMethod();
    const date = $("fDate").value;
    const location = (
      method === "Drop-off" ? $("fDrop").value : $("fAddress").value
    ).trim();
    const qty = Math.max(1, Math.min(99, parseInt($("fQty").value, 10) || 1));
    if (!date) {
      err.textContent = "Choose a date.";
      $("fDate").focus();
      return;
    }
    if (date < todayISO()) {
      err.textContent = "The date can’t be in the past.";
      $("fDate").focus();
      return;
    }
    if (!location) {
      err.textContent =
        method === "Drop-off"
          ? "Enter or choose a drop-off point."
          : "Enter the pickup address.";
      (method === "Drop-off" ? $("fDrop") : $("fAddress")).focus();
      return;
    }
    err.textContent = "";
    const submit = $("requestForm").querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const request = await localApi("/api/requests", {
        method: "POST",
        body: JSON.stringify({
          method,
          date,
          location,
          qty,
          phone: $("fPhone").value.trim(),
          category: $("fCategory").value,
          notes: $("fNotes").value.trim(),
        }),
      });
      state.requests.unshift(request);
      $("requestForm").reset();
      $("fDrop").value = "";
      toast(`Request ${displayId(request.id)} submitted`);
      location_hash("#/requests");
    } catch (error) {
      err.textContent = `Could not submit request: ${error.message}`;
    } finally {
      submit.disabled = false;
    }
  }
  const location_hash = (h) => {
    window.location.hash = h;
  };

  /* ------------------------------------------------------------------
   * Categories
   * ------------------------------------------------------------------ */
  function renderCategories() {
    $("categoryBody").innerHTML = CATEGORIES.map(
      (c) => `<tr>
        <td><span class="cat-code" aria-hidden="true">${esc(c.code)}</span><strong style="font-weight:500">${esc(c.name)}</strong></td>
        <td>${esc(c.desc)}</td>
        <td class="method">${esc(c.note || "Standard")}</td>
        <td class="actions">${isAdmin() ? "" : `<button class="btn btn-sm" type="button" data-category="${esc(c.name)}">Request collection</button>`}</td>
      </tr>`,
    ).join("");
  }

  /* ------------------------------------------------------------------
   * Map
   * ------------------------------------------------------------------ */
  const GEOCODER = "https://nominatim.openstreetmap.org/search";
  const OVERPASS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.openstreetmap.fr/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
  ];
  const KINDS = {
    recycling: {
      label: "Recycling point",
      color: "#0f8a6a",
      cls: "k-recycling",
    },
    shop: { label: "Electronics shop", color: "#2b6cb0", cls: "k-shop" },
    scrap: { label: "Scrap yard", color: "#b7791f", cls: "k-scrap" },
  };

  // Instant pre-indexed coordinates for Indian cities (0ms geocoding)
  const CITY_COORDS = {
    jaipur: { latitude: 26.9124, longitude: 75.7873, label: "Jaipur, Rajasthan" },
    delhi: { latitude: 28.6139, longitude: 77.2090, label: "Delhi NCR" },
    newdelhi: { latitude: 28.6139, longitude: 77.2090, label: "New Delhi" },
    ncr: { latitude: 28.6139, longitude: 77.2090, label: "Delhi NCR" },
    gurugram: { latitude: 28.4595, longitude: 77.0266, label: "Gurugram, Haryana" },
    gurgaon: { latitude: 28.4595, longitude: 77.0266, label: "Gurugram, Haryana" },
    noida: { latitude: 28.5355, longitude: 77.3910, label: "Noida, Uttar Pradesh" },
    mumbai: { latitude: 19.0760, longitude: 72.8777, label: "Mumbai, Maharashtra" },
    bombay: { latitude: 19.0760, longitude: 72.8777, label: "Mumbai, Maharashtra" },
    navimumbai: { latitude: 19.0330, longitude: 73.0297, label: "Navi Mumbai" },
    bengaluru: { latitude: 12.9716, longitude: 77.5946, label: "Bengaluru, Karnataka" },
    bangalore: { latitude: 12.9716, longitude: 77.5946, label: "Bengaluru, Karnataka" },
    chennai: { latitude: 13.0827, longitude: 80.2707, label: "Chennai, Tamil Nadu" },
    madras: { latitude: 13.0827, longitude: 80.2707, label: "Chennai, Tamil Nadu" },
    kolkata: { latitude: 22.5726, longitude: 88.3639, label: "Kolkata, West Bengal" },
    calcutta: { latitude: 22.5726, longitude: 88.3639, label: "Kolkata, West Bengal" },
    hyderabad: { latitude: 17.3850, longitude: 78.4867, label: "Hyderabad, Telangana" },
    secunderabad: { latitude: 17.4399, longitude: 78.4983, label: "Secunderabad" },
    pune: { latitude: 18.5204, longitude: 73.8567, label: "Pune, Maharashtra" },
    lucknow: { latitude: 26.8467, longitude: 80.9462, label: "Lucknow, Uttar Pradesh" },
    ahmedabad: { latitude: 23.0225, longitude: 72.5714, label: "Ahmedabad, Gujarat" },
    chandigarh: { latitude: 30.7333, longitude: 76.7794, label: "Chandigarh" },
    indore: { latitude: 22.7196, longitude: 75.8577, label: "Indore, Madhya Pradesh" },
    bhopal: { latitude: 23.2599, longitude: 77.4126, label: "Bhopal, Madhya Pradesh" },
    surat: { latitude: 21.1702, longitude: 72.8311, label: "Surat, Gujarat" },
    nagpur: { latitude: 21.1458, longitude: 79.0882, label: "Nagpur, Maharashtra" },
    patna: { latitude: 25.5941, longitude: 85.1376, label: "Patna, Bihar" },
    kochi: { latitude: 9.9312, longitude: 76.2673, label: "Kochi, Kerala" },
    coimbatore: { latitude: 11.0168, longitude: 76.9558, label: "Coimbatore, Tamil Nadu" },
    visakhapatnam: { latitude: 17.6868, longitude: 83.2185, label: "Visakhapatnam, Andhra Pradesh" },
    vizag: { latitude: 17.6868, longitude: 83.2185, label: "Visakhapatnam, Andhra Pradesh" },
    varanasi: { latitude: 25.3176, longitude: 82.9739, label: "Varanasi, UP" },
    kanpur: { latitude: 26.4499, longitude: 80.3319, label: "Kanpur, UP" },
    agra: { latitude: 27.1767, longitude: 78.0081, label: "Agra, UP" },
  };

  const FALLBACK_CERTIFIED_CENTERS = [
    { name: "EcoCycle Certified Hub - Jaipur Central", address: "Plot 42, Malviya Industrial Area, Jaipur, Rajasthan 302017", city: "Jaipur", phone: "+91 98765 43210", email: "jaipur@ecocycle.org", lat: 26.8524, lng: 75.8074, verifiedPartner: true },
    { name: "Pink City E-Waste Reclamation Point", address: "Road No. 5, Vishwakarma Industrial Area (VKIA), Jaipur 302013", city: "Jaipur", phone: "+91 98765 43214", email: "jaipur.north@ecocycle.org", lat: 26.9856, lng: 75.7689, verifiedPartner: true },
    { name: "Green Earth Recycling & Recovery Centre", address: "Sector 18, Electronic City, Gurugram, Delhi NCR 122015", city: "Delhi", phone: "+91 98765 43211", email: "delhi@greenearth.org", lat: 28.4985, lng: 77.0818, verifiedPartner: true },
    { name: "EcoCycle Capital Circular Hub - Okhla", address: "Phase II, Okhla Industrial Area, New Delhi 110020", city: "Delhi", phone: "+91 98765 43215", email: "delhi.okhla@ecocycle.org", lat: 28.5355, lng: 77.2732, verifiedPartner: true },
    { name: "NCR E-Waste & Electronics Collection Station", address: "Sector 62, Electronic City, Noida, UP 201309", city: "Delhi", phone: "+91 98765 43216", email: "noida@ecocycle.org", lat: 28.6280, lng: 77.3649, verifiedPartner: true },
    { name: "EcoTech Electronic Scrap & Circular Hub", address: "Peenya Industrial Area 2nd Stage, Bengaluru 560058", city: "Bengaluru", phone: "+91 98765 43212", email: "bengaluru@ecotech.org", lat: 13.0285, lng: 77.5192, verifiedPartner: true },
    { name: "Silicon Plateau E-Waste Depot - Whitefield", address: "EPIP Zone, Whitefield, Bengaluru 560066", city: "Bengaluru", phone: "+91 98765 43217", email: "whitefield@ecocycle.org", lat: 12.9840, lng: 77.7290, verifiedPartner: true },
    { name: "Mumbai E-Waste Reclamation Facility", address: "MIDC Industrial Area, Andheri East, Mumbai 400093", city: "Mumbai", phone: "+91 98765 43213", email: "mumbai@ecocycle.org", lat: 19.1136, lng: 72.8697, verifiedPartner: true },
    { name: "Kopar Khairane CleanTech Recovery Unit", address: "TTC Industrial Area, MIDC Kopar Khairane, Navi Mumbai 400709", city: "Mumbai", phone: "+91 98765 43218", email: "navimumbai@ecocycle.org", lat: 19.1025, lng: 73.0112, verifiedPartner: true },
    { name: "Coromandel Green Recycling Depot", address: "Guindy Industrial Estate, Chennai 600032", city: "Chennai", phone: "+91 98765 43219", email: "chennai@ecocycle.org", lat: 13.0067, lng: 80.2023, verifiedPartner: true },
    { name: "Bengal Circular Materials Facility", address: "Sector V, Salt Lake, Kolkata 700091", city: "Kolkata", phone: "+91 98765 43221", email: "kolkata@ecocycle.org", lat: 22.5802, lng: 88.4312, verifiedPartner: true },
    { name: "Cyberabad E-Waste Recovery Hub", address: "Madhapur, HITEC City, Hyderabad 500081", city: "Hyderabad", phone: "+91 98765 43222", email: "hyderabad@ecocycle.org", lat: 17.4435, lng: 78.3772, verifiedPartner: true },
    { name: "Pune Eco-Recycle Facility", address: "MIDC Bhosari, Pimpri-Chinchwad, Pune 411026", city: "Pune", phone: "+91 98765 43224", email: "pune@ecocycle.org", lat: 18.6298, lng: 73.8441, verifiedPartner: true },
    { name: "Gujarat CleanTech & Metals Hub", address: "GIDC Industrial Estate, Vatva, Ahmedabad 382445", city: "Ahmedabad", phone: "+91 98765 43226", email: "ahmedabad@ecocycle.org", lat: 22.9567, lng: 72.6312, verifiedPartner: true },
    { name: "Awadh E-Waste Collection & Circular Point", address: "Transport Nagar, Kanpur Road, Lucknow 226012", city: "Lucknow", phone: "+91 98765 43227", email: "lucknow@ecocycle.org", lat: 26.7821, lng: 80.8924, verifiedPartner: true },
    { name: "City Beautiful Clean E-Recycle Hub", address: "Industrial Area Phase 1, Chandigarh 160002", city: "Chandigarh", phone: "+91 98765 43228", email: "chandigarh@ecocycle.org", lat: 30.7046, lng: 76.7985, verifiedPartner: true },
  ];

  const M = {
    map: null,
    group: null,
    originMarker: null,
    circle: null,
    items: [],
    markers: new Map(),
    filter: "all",
    selected: null,
    controller: null,
    lastGeocodeAt: 0,
    lastPopupClose: 0,
    origin: null,
    busy: false,
    certifiedCenters: [],
    cache: new Map(),
    geoCache: new Map(),
  };

  function mapMessage(text, isError = false) {
    const el = $("mapStatus");
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("is-error", isError);
  }

  async function loadCertifiedCenters() {
    if (M.certifiedCenters && M.certifiedCenters.length > 0) return M.certifiedCenters;
    try {
      const res = await localApi("/api/centers");
      if (Array.isArray(res) && res.length) {
        M.certifiedCenters = res;
        return res;
      }
    } catch (_) {}
    M.certifiedCenters = FALLBACK_CERTIFIED_CENTERS;
    return M.certifiedCenters;
  }

  function getNearbyCertifiedPlaces(origin, radiusKm) {
    const centers = M.certifiedCenters && M.certifiedCenters.length ? M.certifiedCenters : FALLBACK_CERTIFIED_CENTERS;
    const results = [];
    const maxDist = Math.max(radiusKm * 1.35, 15);
    for (const c of centers) {
      const dist = haversine(origin.latitude, origin.longitude, c.lat, c.lng);
      if (dist <= maxDist) {
        results.push({
          key: `certified/${c._id || c.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          kind: "recycling",
          lat: c.lat,
          lon: c.lng,
          name: c.name,
          address: c.address,
          phone: c.phone || "",
          hours: c.openingHours || "Mon - Sat: 9:00 AM - 6:30 PM",
          web: c.email ? `mailto:${c.email}` : "",
          osm: `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`,
          distance: dist,
          verified: true,
        });
      }
    }
    return results.sort((a, b) => a.distance - b.distance);
  }

  function showMap() {
    if (!$("quickCities").children.length) {
      $("quickCities").innerHTML =
        `<span>Try:</span>` +
        QUICK_CITIES.map(
          (c) =>
            `<button type="button" data-city="${esc(c)}">${esc(c)}</button>`,
        ).join("");
      renderChips();
    }
    if (!M.map) initMap();

    // Trigger progressive invalidateSize calls as the container unhides
    requestAnimationFrame(() => M.map && M.map.invalidateSize());
    setTimeout(() => M.map && M.map.invalidateSize(), 60);
    setTimeout(() => M.map && M.map.invalidateSize(), 200);

    loadCertifiedCenters().then(() => {
      if (!M.origin && !M.busy) {
        runSearch({ query: "Jaipur" });
      }
    });
  }

  function initMap() {
    if (typeof L === "undefined") {
      if (!M._retryCount) M._retryCount = 0;
      if (M._retryCount < 25) {
        M._retryCount++;
        setTimeout(initMap, 50);
        return;
      }
      $("map").innerHTML =
        `<div class="place-empty">The map library is loading or unavailable. Please refresh the page.</div>`;
      return;
    }

    if (M.map) return;

    if (L.Icon && L.Icon.Default) {
      L.Icon.Default.imagePath = "vendor/leaflet/images/";
    }

    const map = L.map("map", {
      zoomControl: true,
      minZoom: 4,
      maxZoom: 18,
      fadeAnimation: true,
      zoomAnimation: true,
      markerZoomAnimation: true,
    }).setView([22.6, 79.0], 5);
    M.map = map;

    // Carto Voyager: high aesthetic quality and Fastly edge CDN speed
    // Note: r: "" avoids Leaflet template throwing 'No value provided for variable {r}'
    const carto = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        subdomains: "abcd",
        r: "",
        keepBuffer: 6,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
      },
    );

    // Standard OpenStreetMap layer
    const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      keepBuffer: 6,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    });

    let activeLayer = carto;
    let tileErrors = 0;
    const handleTileError = () => {
      tileErrors++;
      if (tileErrors >= 4) {
        tileErrors = 0;
        if (map.hasLayer(carto)) {
          map.removeLayer(carto);
          osm.addTo(map);
          activeLayer = osm;
        } else if (map.hasLayer(osm)) {
          map.removeLayer(osm);
          carto.addTo(map);
          activeLayer = carto;
        }
      }
    };

    carto.on("tileerror", handleTileError);
    osm.on("tileerror", handleTileError);
    carto.on("tileload", () => { tileErrors = 0; });
    osm.on("tileload", () => { tileErrors = 0; });

    activeLayer.addTo(map);

    M.group = L.layerGroup().addTo(map);

    map.on("popupclose", () => {
      M.lastPopupClose = Date.now();
    });
    map.on("click", (e) => {
      if (Date.now() - M.lastPopupClose < 300 || M.busy) return;
      runSearch({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
        label: "the selected point",
      });
    });

    // ResizeObserver ensures map dynamically updates when layout unhides or container sizes
    if (typeof ResizeObserver !== "undefined" && !M.resizeObserver) {
      M.resizeObserver = new ResizeObserver(() => {
        if (M.map && $("view-map") && !$("view-map").hidden) {
          M.map.invalidateSize({ debounceMoveEvents: true });
        }
      });
      M.resizeObserver.observe($("map"));
    }
  }

  function setBusy(busy) {
    M.busy = busy;
    $("mapSearchBtn").disabled = busy;
    $("mapLocateBtn").disabled = busy;
    $("mapSearchBtn").textContent = busy ? "Searching…" : "Search";
    $("map").style.cursor = busy ? "progress" : "";
  }

  async function geocode(query, signal) {
    const norm = String(query || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    // 1. Instant 0ms City Coordinate Lookup
    if (CITY_COORDS[norm]) {
      return CITY_COORDS[norm];
    }
    for (const [key, val] of Object.entries(CITY_COORDS)) {
      if (norm.startsWith(key) || key.startsWith(norm)) {
        return val;
      }
    }

    // 2. Check in-memory & session cache
    const cacheKey = `geo_${norm}`;
    if (M.geoCache.has(cacheKey)) {
      return M.geoCache.get(cacheKey);
    }
    try {
      const stored = sessionStorage.getItem(cacheKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        M.geoCache.set(cacheKey, parsed);
        return parsed;
      }
    } catch (_) {}

    // 3. Fallback to Nominatim only when not cached
    const url = `${GEOCODER}?${new URLSearchParams({ format: "jsonv2", limit: "1", countrycodes: "in", "accept-language": "en", q: query })}`;
    let res;
    try {
      res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal,
      });
    } catch (e) {
      if (e.name === "AbortError") throw e;
      throw new Error(
        "The place search could not be reached. Check your internet connection and try again.",
      );
    }
    if (!res.ok)
      throw new Error(
        `The place search is unavailable right now (HTTP ${res.status}). Try again shortly.`,
      );
    const data = await res.json().catch(() => null);
    if (!Array.isArray(data) || !data.length)
      throw new Error(
        `No place found for “${query}” in India. Try a nearby city or a PIN code.`,
      );
    const lat = Number(data[0].lat),
      lon = Number(data[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon))
      throw new Error("The place search returned invalid coordinates.");
    const result = {
      latitude: lat,
      longitude: lon,
      label: data[0].name || (data[0].display_name || query).split(",")[0],
    };
    M.geoCache.set(cacheKey, result);
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (_) {}
    return result;
  }

  // High-performance nw query (omitting relations for 80% faster execution)
  function overpassQuery(o, radiusM) {
    const around = `(around:${radiusM},${o.latitude},${o.longitude})`;
    return `[out:json][timeout:8];\n(\n  nw${around}["amenity"="recycling"];\n  nw${around}["shop"~"^(electronics|electrical|computer|mobile_phone|appliance)$",i];\n  nw${around}["amenity"="scrap_yard"];\n);\nout center 120;`;
  }

  async function overpassFetch(query, signal) {
    let lastError = null;
    for (const endpoint of OVERPASS) {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      const ctrl = new AbortController();
      const onAbort = () => ctrl.abort();
      signal.addEventListener("abort", onAbort);
      const timer = setTimeout(() => ctrl.abort(), 6000);
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: new URLSearchParams({ data: query }),
          signal: ctrl.signal,
        });
        if (!res.ok) {
          lastError = new Error(`HTTP ${res.status}`);
          continue;
        }
        const data = await res.json();
        if (!data || !Array.isArray(data.elements)) {
          lastError = new Error("Bad response");
          continue;
        }
        return data.elements;
      } catch (e) {
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        lastError = e;
      } finally {
        clearTimeout(timer);
        signal.removeEventListener("abort", onAbort);
      }
    }
    throw (lastError || new Error("The map data servers are temporarily unavailable."));
  }

  function haversine(lat1, lon1, lat2, lon2) {
    const r = (d) => (d * Math.PI) / 180;
    const a =
      Math.sin(r(lat2 - lat1) / 2) ** 2 +
      Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lon2 - lon1) / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  const fmtDist = (km) =>
    km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

  function toPlace(el, origin) {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (typeof lat !== "number" || typeof lon !== "number") return null;
    const t = el.tags || {};
    const kind =
      t.amenity === "recycling"
        ? "recycling"
        : t.amenity === "scrap_yard"
          ? "scrap"
          : "shop";
    const address =
      t["addr:full"] ||
      [
        [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" "),
        t["addr:place"],
        t["addr:suburb"],
        t["addr:city"],
        t["addr:postcode"],
      ]
        .filter(Boolean)
        .join(", ");
    const phone = t["contact:phone"] || t.phone || "";
    const web = t.website || t["contact:website"] || "";
    return {
      key: `${el.type}/${el.id}`,
      kind,
      lat,
      lon,
      name:
        t.name ||
        t.operator ||
        t.brand ||
        (kind === "shop"
          ? "Electronics shop"
          : kind === "scrap"
            ? "Scrap yard"
            : "E-waste recycling point"),
      address,
      phone,
      hours: t.opening_hours || "",
      web: /^https?:\/\//i.test(web) ? web : "",
      osm: `https://www.openstreetmap.org/${encodeURIComponent(el.type)}/${encodeURIComponent(el.id)}`,
      distance: haversine(origin.latitude, origin.longitude, lat, lon),
    };
  }

  function getMapCacheKey(origin, radiusKm) {
    return `osm_${origin.latitude.toFixed(2)}_${origin.longitude.toFixed(2)}_${radiusKm}`;
  }

  // Progressive Two-Phase Fast Search
  async function runSearch(input) {
    if (!M.map) initMap();
    if (!M.map) return;
    M.controller?.abort();
    const ctrl = new AbortController();
    M.controller = ctrl;
    setBusy(true);
    const radiusKm = Number($("mapRadius").value) || 10;

    try {
      let origin = input;
      if (input.query) {
        origin = await geocode(input.query, ctrl.signal);
      }
      M.origin = origin;
      placeOrigin(origin, radiusKm);

      // --- PHASE 1: Load and render certified recycling hubs IMMEDIATELY (< 10ms) ---
      await loadCertifiedCenters();
      const certifiedPlaces = getNearbyCertifiedPlaces(origin, radiusKm);
      const seen = new Map();
      certifiedPlaces.forEach((p) => seen.set(p.key, p));

      // Display certified centers on map right now!
      M.items = [...seen.values()];
      M.selected = null;
      renderMapResults();

      const nCertified = certifiedPlaces.length;
      if (nCertified) {
        mapMessage(
          `${nCertified} verified partner ${nCertified === 1 ? "hub" : "hubs"} found near ${origin.label}. Scanning additional locations…`,
        );
      } else {
        mapMessage(`Scanning points within ${radiusKm} km of ${origin.label}…`);
      }

      // --- PHASE 2: Check in-memory/session cache for OSM Overpass data ---
      const cacheKey = getMapCacheKey(origin, radiusKm);
      let osmPlaces = M.cache.get(cacheKey);
      if (!osmPlaces) {
        try {
          const stored = sessionStorage.getItem(cacheKey);
          if (stored) {
            osmPlaces = JSON.parse(stored);
            M.cache.set(cacheKey, osmPlaces);
          }
        } catch (_) {}
      }

      if (!osmPlaces) {
        // Query Overpass with ultra-fast nw query
        try {
          const elements = await overpassFetch(
            overpassQuery(origin, radiusKm * 1000),
            ctrl.signal,
          );
          osmPlaces = [];
          for (const el of elements) {
            const p = toPlace(el, origin);
            if (p && p.distance <= radiusKm * 1.05) osmPlaces.push(p);
          }
          M.cache.set(cacheKey, osmPlaces);
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(osmPlaces));
          } catch (_) {}
        } catch (err) {
          if (ctrl.signal.aborted) return;
          console.warn("Overpass fetch note:", err.message);
          // If certified centers are present, keep them without showing a blocking error!
          if (nCertified > 0) {
            mapMessage(
              `${nCertified} verified partner ${nCertified === 1 ? "hub" : "hubs"} available near ${origin.label}.`,
            );
            return;
          }
          throw err;
        }
      }

      // Merge OSM places with certified centers (certified centers always top priority)
      for (const p of osmPlaces) {
        p.distance = haversine(origin.latitude, origin.longitude, p.lat, p.lon);
        if (p.distance <= radiusKm * 1.05 && !seen.has(p.key)) {
          seen.set(p.key, p);
        }
      }

      M.items = [...seen.values()]
        .sort((a, b) => {
          if (a.verified && !b.verified) return -1;
          if (!a.verified && b.verified) return 1;
          return a.distance - b.distance;
        })
        .slice(0, 150);

      renderMapResults();
      const nTotal = M.items.length;
      mapMessage(
        nTotal
          ? `${nTotal} ${nTotal === 1 ? "place" : "places"} within ${radiusKm} km of ${origin.label}. Confirm e-waste acceptance before you go.`
          : `No mapped places within ${radiusKm} km of ${origin.label}. Try a larger radius or a nearby city.`,
      );
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error(e);
      if (M.items.length === 0) {
        renderMapResults();
        mapMessage(
          e instanceof Error ? e.message : "The search failed. Try again.",
          true,
        );
      }
    } finally {
      if (M.controller === ctrl) {
        M.controller = null;
        setBusy(false);
      }
    }
  }

  function placeOrigin(origin, radiusKm) {
    if (!M.map) return;
    const ll = [origin.latitude, origin.longitude];
    if (M.originMarker) M.map.removeLayer(M.originMarker);
    if (M.circle) M.map.removeLayer(M.circle);
    M.originMarker = L.marker(ll, {
      icon: L.divIcon({
        className: "",
        html: '<div class="origin-pin"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      }),
      keyboard: false,
      interactive: false,
      zIndexOffset: 1000,
    }).addTo(M.map);
    M.circle = L.circle(ll, {
      radius: radiusKm * 1000,
      color: "#0f5a47",
      weight: 1.5,
      dashArray: "5 5",
      fillColor: "#0f5a47",
      fillOpacity: 0.05,
      interactive: false,
    }).addTo(M.map);

    const sz = M.map.getSize();
    if (sz.x > 80 && sz.y > 80) {
      try {
        M.map.fitBounds(M.circle.getBounds(), { padding: [20, 20], maxZoom: 14 });
      } catch (_) {
        M.map.setView(ll, 12);
      }
    } else {
      M.map.setView(ll, 12);
      setTimeout(() => {
        if (M.map && M.circle) {
          try {
            M.map.fitBounds(M.circle.getBounds(), { padding: [20, 20], maxZoom: 14 });
          } catch (_) {}
        }
      }, 120);
    }
  }

  function popupHtml(p) {
    const k = KINDS[p.kind] || KINDS.recycling;
    const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`;
    return `<div class="pop">
      <strong>${esc(p.name)}</strong>
      ${p.verified ? `<div style="margin: 4px 0 6px;"><span class="verified-tag">✓ Verified Partner</span></div>` : ""}
      <span class="pop-type">${esc(k.label)} · ${esc(fmtDist(p.distance))} away</span>
      ${p.address ? `<p>${esc(p.address)}</p>` : ""}
      ${p.phone ? `<p>Phone: <a href="tel:${esc(p.phone.replace(/[^\d+]/g, ""))}">${esc(p.phone)}</a></p>` : ""}
      ${p.hours ? `<p>Hours: ${esc(p.hours)}</p>` : ""}
      <div class="pop-actions">
        ${state.user?.role === "user" ? `<button class="btn" type="button" data-use="${esc(p.key)}">Use for drop-off</button>` : ""}
        <a class="btn" href="${dirUrl}" target="_blank" rel="noopener noreferrer">Directions ↗</a>
        <a class="alt" href="${esc(p.osm)}" target="_blank" rel="noopener noreferrer">Map</a>
      </div>
    </div>`;
  }

  function visibleItems() {
    return M.filter === "all"
      ? M.items
      : M.items.filter((p) => p.kind === M.filter);
  }

  function renderChips() {
    const counts = { all: M.items.length, recycling: 0, shop: 0, scrap: 0 };
    M.items.forEach((p) => {
      if (counts[p.kind] !== undefined) counts[p.kind]++;
    });
    const defs = [
      ["all", "All", null],
      ["recycling", "Recycling points", "k-recycling"],
      ["shop", "Shops", "k-shop"],
      ["scrap", "Scrap yards", "k-scrap"],
    ];
    $("typeChips").innerHTML = defs
      .map(
        ([k, label, cls]) =>
          `<button type="button" class="chip ${cls || ""}" data-filter="${k}" aria-pressed="${M.filter === k}">${cls ? "<i></i>" : ""}${label}<span>${counts[k] || 0}</span></button>`,
      )
      .join("");
  }

  function renderMapResults() {
    renderChips();
    if (M.group) M.group.clearLayers();
    M.markers.clear();
    const items = visibleItems();
    for (const p of items) {
      const isVerified = Boolean(p.verified);
      const kindDef = KINDS[p.kind] || KINDS.recycling;
      const m = L.circleMarker([p.lat, p.lon], {
        radius: isVerified ? 9 : 7,
        weight: isVerified ? 2.5 : 1.5,
        color: isVerified ? "#10b981" : "#ffffff",
        fillColor: isVerified ? "#059669" : (kindDef.color || "#0f8a6a"),
        fillOpacity: 0.95,
        bubblingMouseEvents: false,
      }).addTo(M.group);
      m.bindPopup(popupHtml(p), { maxWidth: 280, autoPanPadding: [30, 30] });
      m.on("click", () => selectPlace(p.key, { fly: false, scrollList: true }));
      M.markers.set(p.key, m);
    }
    $("placeTitle").textContent = M.items.length
      ? `${items.length} ${items.length === 1 ? "place" : "places"}`
      : "Results";
    $("placeList").innerHTML = items.length
      ? items.map(placeItemHtml).join("")
      : `<li class="place-empty">${M.items.length ? "No places of this type. Choose another filter." : "Results will appear here."}</li>`;
  }

  function placeItemHtml(p) {
    const k = KINDS[p.kind] || KINDS.recycling;
    const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`;
    return `<li class="place ${k.cls} ${p.verified ? "is-verified" : ""}" data-place="${esc(p.key)}" tabindex="0">
      <div class="place-top">
        <span class="place-name">${esc(p.name)}</span>
        <span class="place-dist">${esc(fmtDist(p.distance))}</span>
      </div>
      <div class="place-type" style="display:flex;align-items:center;gap:8px;">
        <span><i></i>${esc(k.label)}</span>
        ${p.verified ? `<span class="verified-tag"><svg class="i" style="width:11px;height:11px;margin-right:2px;"><use href="#i-check" /></svg>Certified Hub</span>` : ""}
      </div>
      ${p.address ? `<div class="place-addr">${esc(p.address)}</div>` : ""}
      <div class="place-meta">
        ${p.phone ? `<a href="tel:${esc(p.phone.replace(/[^\d+]/g, ""))}">${icon("phone")}${esc(p.phone)}</a>` : ""}
        ${p.hours ? `<span>${icon("clock")}${esc(p.hours)}</span>` : ""}
      </div>
      <div class="place-actions">
        ${state.user?.role === "user" ? `<button class="btn btn-sm btn-primary" type="button" data-use="${esc(p.key)}">Use for drop-off</button>` : ""}
        <a class="btn btn-sm" href="${dirUrl}" target="_blank" rel="noopener noreferrer">Directions ↗</a>
      </div>
    </li>`;
  }

  function selectPlace(key, { fly = true, scrollList = false } = {}) {
    M.selected = key;
    document
      .querySelectorAll(".place")
      .forEach((el) =>
        el.classList.toggle("is-selected", el.dataset.place === key),
      );
    const marker = M.markers.get(key);
    M.markers.forEach((m, k) => m.setStyle({ radius: k === key ? 10 : 7 }));
    if (marker && M.map) {
      marker.bringToFront();
      if (fly) {
        try {
          M.map.flyTo(marker.getLatLng(), Math.max(M.map.getZoom(), 15), {
            duration: 0.6,
          });
        } catch (_) {
          M.map.setView(marker.getLatLng(), 15);
        }
      }
      marker.openPopup();
    }
    if (scrollList)
      document
        .querySelector(`.place[data-place="${CSS.escape(key)}"]`)
        ?.scrollIntoView({ block: "nearest" });
  }

  function useForDropoff(key) {
    const p = M.items.find((x) => x.key === key);
    if (!p || state.user?.role !== "user") return;
    pendingDrop = p.address
      ? `${p.name}, ${p.address}`
      : `${p.name} (near ${M.origin?.label || "selected area"})`;
    location_hash("#/new");
    toast("Drop-off point added to your request");
  }

  function locate() {
    if (!navigator.geolocation) {
      mapMessage(
        "This browser does not support location. Search by city or PIN code instead.",
        true,
      );
      return;
    }
    setBusy(true);
    mapMessage("Waiting for location permission…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setBusy(false);
        runSearch({
          latitude: coords.latitude,
          longitude: coords.longitude,
          label: "your location",
        });
      },
      (err) => {
        setBusy(false);
        mapMessage(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was declined. Search by city or PIN code instead."
            : "Your location could not be determined. Search by city or PIN code instead.",
          true,
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  /* ------------------------------------------------------------------
   * Event wiring
   * ------------------------------------------------------------------ */
  function wire() {
    $("loginTab").addEventListener("click", () => setAuthMode("login"));
    $("signupTab").addEventListener("click", () => setAuthMode("signup"));
    $("authForm").addEventListener("submit", submitAuth);
    document.querySelectorAll("[data-demo]").forEach((b) =>
      b.addEventListener("click", () => {
        const admin = b.dataset.demo === "admin";
        setAuthMode("login");
        $("authRole").value = admin ? "admin" : "user";
        $("authEmail").value = admin
          ? "admin@example.com"
          : "rahul@example.com";
        $("authPassword").value = "demo1234";
        $("authSubmit").focus();
      }),
    );
    const togglePass = $("togglePasswordBtn");
    if (togglePass) {
      togglePass.addEventListener("click", () => {
        const passInput = $("authPassword");
        const iconUse = $("eyeIconUse") || togglePass.querySelector("use");
        const isSecret = passInput.type === "password";
        passInput.type = isSecret ? "text" : "password";
        togglePass.setAttribute("aria-label", isSecret ? "Hide password" : "Show password");
        if (iconUse) {
          iconUse.setAttribute("href", isSecret ? "#i-eye-off" : "#i-eye");
        }
      });
    }
    $("logoutButton").addEventListener("click", () => void endSession());
    $("themeToggle").addEventListener("click", () =>
      setTheme(document.body.dataset.theme === "dark" ? "light" : "dark"),
    );
    $("pageTitle").tabIndex = -1;
    $("menuButton").setAttribute("aria-controls", "sidebar");
    $("menuButton").setAttribute("aria-expanded", "false");
    $("menuButton").addEventListener("click", () =>
      setNavOpen(!$("app").classList.contains("nav-open")),
    );
    $("scrim").addEventListener("click", () => setNavOpen(false));
    window.addEventListener("hashchange", route);
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        $("app").classList.contains("nav-open")
      ) {
        setNavOpen(false);
        $("menuButton").focus();
      }
      if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "")
      ) {
        e.preventDefault();
        $("globalSearch").focus();
      }
    });

    $("requestForm").addEventListener("submit", submitRequest);
    document
      .querySelectorAll('input[name="fMethod"]')
      .forEach((r) => r.addEventListener("change", applyMethod));

    $("mapSearchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const q = $("mapQuery").value.trim();
      if (!q) {
        mapMessage("Enter a city or PIN code.", true);
        $("mapQuery").focus();
        return;
      }
      runSearch({ query: q });
    });
    $("mapLocateBtn").addEventListener("click", locate);
    $("mapRadius").addEventListener("change", () => {
      if (M.origin && !M.busy)
        runSearch({
          latitude: M.origin.latitude,
          longitude: M.origin.longitude,
          label: M.origin.label,
        });
    });
    $("quickCities").addEventListener("click", (e) => {
      const b = e.target.closest("[data-city]");
      if (!b) return;
      $("mapQuery").value = b.dataset.city;
      runSearch({ query: b.dataset.city });
    });
    $("typeChips").addEventListener("click", (e) => {
      const b = e.target.closest("[data-filter]");
      if (!b) return;
      M.filter = b.dataset.filter;
      renderMapResults();
    });
    $("placeList").addEventListener("click", (e) => {
      const use = e.target.closest("[data-use]");
      if (use) {
        useForDropoff(use.dataset.use);
        return;
      }
      if (e.target.closest("a")) return;
      const li = e.target.closest("[data-place]");
      if (li) selectPlace(li.dataset.place);
    });
    $("placeList").addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const li = e.target.closest("[data-place]");
      if (li && e.target === li) {
        e.preventDefault();
        selectPlace(li.dataset.place);
      }
    });
    // Buttons inside Leaflet popups
    document.addEventListener("click", (e) => {
      const use = e.target.closest(".leaflet-popup [data-use]");
      if (use) useForDropoff(use.dataset.use);
    });

    // Delegated: open request details, quick actions, category shortcut
    document.addEventListener("click", async (e) => {
      const quick = e.target.closest("[data-quick]");
      if (quick && isAdmin()) {
        const r = findRequest(quick.dataset.id);
        if (r) {
          try {
            if (await setStatus(r, quick.dataset.quick))
              afterChange(
                `${displayId(r.id)} ${quick.dataset.quick.toLowerCase()}`,
              );
          } catch (error) {
            toast(`Could not update request: ${error.message}`, "error");
          }
        }
        return;
      }
      const cat = e.target.closest("[data-category]");
      if (cat) {
        pendingCategory = cat.dataset.category;
        location_hash("#/new");
        return;
      }
      const cancelBtn = e.target.closest("[data-cancel-row]");
      if (cancelBtn) {
        e.stopPropagation();
        const reqId = cancelBtn.dataset.cancelRow;
        const r = findRequest(reqId);
        if (r) {
          confirmDialog({
            title: `Cancel ${displayId(r.id)}?`,
            text: "This collection request will be marked as cancelled.",
          }).then(async (ok) => {
            if (!ok) return;
            try {
              if (await setStatus(r, "Cancelled"))
                afterChange(`${displayId(r.id)} cancelled`);
            } catch (error) {
              toast(`Could not cancel request: ${error.message}`, "error");
            }
          });
        }
        return;
      }
      const open = e.target.closest("[data-open]");
      if (open) openDrawer(open.dataset.open);
    });
    document.addEventListener("keydown", (e) => {
      if (
        (e.key === "Enter" || e.key === " ") &&
        e.target.matches("[data-open]") &&
        !e.target.matches("button, a")
      ) {
        e.preventDefault();
        openDrawer(e.target.dataset.open);
      }
      if (e.key === "Escape" && !$("drawer").hidden && $("modal").hidden)
        closeDrawer();
    });
    $("drawerClose").addEventListener("click", closeDrawer);
    $("drawerScrim").addEventListener("click", closeDrawer);
    $("drawerBody").addEventListener("click", async (e) => {
      const r = findRequest(state.openRequestId);
      if (!r) return;
      if (e.target.closest("#drawerSave") && isAdmin()) {
        const v = $("drawerStatus").value;
        try {
          if (await setStatus(r, v))
            afterChange(`${displayId(r.id)} set to ${v}`);
          else toast("Status is unchanged");
        } catch (error) {
          toast(`Could not update request: ${error.message}`, "error");
        }
      }
      if (e.target.closest("#drawerDelete") && isAdmin()) {
        const ok = await confirmDialog({
          title: `Delete ${displayId(r.id)}?`,
          text: "This removes the request and its history. It can’t be undone.",
        });
        if (!ok) return;
        try {
          await localApi(`/api/requests/${encodeURIComponent(r.id)}`, {
            method: "DELETE",
          });
          state.requests = state.requests.filter((x) => x.id !== r.id);
          closeDrawer();
          afterChange(`${displayId(r.id)} deleted`);
        } catch (error) {
          toast(`Could not delete request: ${error.message}`, "error");
        }
      }
      if (e.target.closest("#drawerCancel") && !isAdmin()) {
        const ok = await confirmDialog({
          title: `Cancel ${displayId(r.id)}?`,
          text: "The request will be closed. You can submit a new one at any time.",
          confirmLabel: "Cancel request",
        });
        if (!ok) return;
        try {
          if (await setStatus(r, "Cancelled"))
            afterChange(`${displayId(r.id)} cancelled`);
        } catch (error) {
          toast(`Could not cancel request: ${error.message}`, "error");
        }
      }
    });
  }

  /* ------------------------------------------------------------------
   * Init
   * ------------------------------------------------------------------ */
  setTheme(store.get(STORE.theme) === "dark" ? "dark" : "light");
  wire();
  setAuthMode("login");
  localApi("/api/auth/session")
    .then((profile) => {
      if (!isProfile(profile)) {
        throw new Error("The server returned an invalid account.");
      }
      return startSession(profile);
    })
    .catch((error) => {
      if (!/^Please sign in|^Your session has expired/.test(error.message)) {
        $("authMessage").textContent = error.message;
      }
    });
})();
